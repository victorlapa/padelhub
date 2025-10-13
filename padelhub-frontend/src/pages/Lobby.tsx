import ChatButton from "@/components/ChatButton";
import GameChat from "@/components/GameChat";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, UserPlus, MapPin, Clock, Loader2 } from "lucide-react";
import CourtUser from "@/components/Lobby/CourtUser";
import Spacer from "@/components/Spacer";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getMatchById } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface PlayerAssignment {
  playerId: string;
  team: "A" | "B" | "unassigned";
  position?: "left" | "right";
}

const Lobby = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [confirmedPlayers, setConfirmedPlayers] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Fetch match data from API
  const { data: match, isLoading, error } = useQuery({
    queryKey: ["match", lobbyId],
    queryFn: () => getMatchById(lobbyId!),
    enabled: !!lobbyId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Team assignments state - derived from match players
  const [playerAssignments, setPlayerAssignments] = useState<
    Map<string, PlayerAssignment>
  >(new Map());

  // Update player assignments when match data changes
  useEffect(() => {
    if (match?.matchPlayers) {
      const newAssignments = new Map<string, PlayerAssignment>();
      match.matchPlayers.forEach((mp) => {
        newAssignments.set(mp.userId, {
          playerId: mp.userId,
          team: mp.team === "UNASSIGNED" ? "unassigned" : mp.team,
        });
      });
      setPlayerAssignments(newAssignments);
    }
  }, [match]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p>Carregando partida...</p>
      </div>
    );
  }

  // Error state
  if (error || !match) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <h1 className="mb-4 text-2xl">Partida não encontrada</h1>
        <button
          onClick={() => navigate("/app")}
          className="text-blue-400 hover:underline"
        >
          Voltar para partidas
        </button>
      </div>
    );
  }

  // Transform match data to lobby format for compatibility
  const lobby = {
    id: match.matchId,
    club: {
      name: match.club.name,
      neighbourhood: "", // Not available in backend
      address: match.club.address,
      mapsLink: `https://maps.google.com/?q=${encodeURIComponent(match.club.address)}`,
    },
    category: match.category,
    startTime: new Date(match.startDate),
    endTime: new Date(match.endDate),
    currentPlayers: match.matchPlayers.length,
    maxPlayers: 4,
    isCourtScheduled: match.isCourtScheduled,
    players: match.matchPlayers.map((mp) => ({
      id: mp.userId,
      name: `${mp.user.firstName} ${mp.user.lastName}`,
      elo: mp.user.category ? mp.user.category * 100 : 800,
      team: mp.team === "UNASSIGNED" ? ("unassigned" as const) : mp.team,
      position: "left" as const, // Default position
    })),
  };

  const currentUserId = user?.id || "";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUserConfirmed = confirmedPlayers.has(currentUserId);

  const toggleConfirmation = () => {
    setConfirmedPlayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentUserId)) {
        newSet.delete(currentUserId);
      } else {
        newSet.add(currentUserId);
      }
      return newSet;
    });
  };

  // Helper function to get player assignment
  const getPlayerAssignment = (playerId: string): PlayerAssignment => {
    return playerAssignments.get(playerId) || { playerId, team: "unassigned" };
  };

  // Helper function to get players by team
  const getPlayersByTeam = (team: "A" | "B" | "unassigned") => {
    if (!lobby?.players) return [];
    return lobby.players.filter(
      (player) => getPlayerAssignment(player.id).team === team
    );
  };

  // Assign current user to team (only current user can change their own assignment)
  const assignCurrentUserToTeam = (team: "A" | "B" | "unassigned") => {
    setPlayerAssignments((prev) => {
      const newMap = new Map(prev);
      if (team === "unassigned") {
        newMap.delete(currentUserId);
      } else {
        newMap.set(currentUserId, { playerId: currentUserId, team });
      }
      return newMap;
    });
    // Note: Backend API endpoint for updating team assignment will be added in future
    // PATCH /matches/:matchId/players/:userId/team { team: "A" | "B" | "UNASSIGNED" }
  };

  const teamAPlayers = getPlayersByTeam("A");
  const teamBPlayers = getPlayersByTeam("B");
  const unassignedPlayers = getPlayersByTeam("unassigned");

  // Check if all players are confirmed
  const allPlayersConfirmed =
    lobby?.players?.length > 0 &&
    lobby.players.every((player) => confirmedPlayers.has(player.id));

  // Check if match is ready (court scheduled AND all players confirmed)
  const isMatchReady = lobby.isCourtScheduled && allPlayersConfirmed;

  // Calculate time remaining until match start
  useEffect(() => {
    if (!isMatchReady || !lobby) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = lobby.startTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Jogo começou!");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isMatchReady, lobby]);

  const handleOpenMaps = () => {
    if (lobby?.club?.mapsLink) {
      window.open(lobby.club.mapsLink, '_blank');
    }
  };

  // If match is ready, show the ready state
  if (isMatchReady) {
    return (
      <section className="relative flex h-full w-full flex-col bg-gray-950">
        {/* Header */}
        <div className="relative z-10 shrink-0 bg-gradient-to-b from-gray-900 to-gray-900/95 px-4 py-4 shadow-2xl">
          <button
            onClick={() => navigate("/app")}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center pt-1">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500/10 px-4 py-1.5 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-500 uppercase tracking-wide">
                Partida Confirmada
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mb-0.5">
              {lobby.club.name}
            </h1>
            <p className="text-sm text-gray-400">{lobby.club.neighbourhood}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 py-5 space-y-4">
          {/* Countdown Timer - Hero Section */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 p-6 shadow-2xl"
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]" />

            <div className="relative">
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-white/90" />
                  <p className="text-sm font-medium text-white/90 uppercase tracking-wider">
                    Início
                  </p>
                </div>
                <div className="mb-1">
                  <p className="text-5xl font-black text-white tracking-tight">
                    {formatTime(lobby.startTime)}
                  </p>
                </div>
                <p className="text-sm text-white/80 font-medium capitalize">
                  {lobby.startTime.toLocaleDateString("pt-PT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                  })}
                </p>
              </div>

              <div className="rounded-2xl bg-black/20 backdrop-blur-sm px-5 py-4 border border-white/10">
                <p className="text-xs text-white/70 mb-2 uppercase tracking-wider text-center font-semibold">
                  Tempo restante
                </p>
                <p className="text-4xl font-mono font-black text-white text-center tracking-tight">
                  {timeRemaining}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Court Address Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="rounded-2xl bg-gray-900/80 border border-gray-800 overflow-hidden shadow-xl"
          >
            <div className="p-5 pb-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="rounded-full bg-blue-500/10 p-2.5">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white mb-1.5">
                    Local da Partida
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {lobby.club.address}
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={handleOpenMaps}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 font-bold text-white shadow-lg active:from-blue-700 active:to-blue-800 flex items-center justify-center gap-2.5 border-t border-blue-500/20"
            >
              <MapPin className="h-5 w-5" />
              <span>Abrir no Google Maps</span>
            </motion.button>
          </motion.div>

          {/* Teams Display */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-base font-bold text-white text-center mb-4">
              Formação das Duplas
            </h3>

            {/* Team A */}
            <div className="rounded-2xl bg-gray-900/80 border-2 border-blue-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 px-4 py-2.5 border-b border-blue-500/20">
                <p className="text-sm font-bold text-blue-400 uppercase tracking-wide">
                  Dupla A
                </p>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap justify-center gap-3">
                  {teamAPlayers.map((player) => (
                    <div key={player.id} className="relative">
                      <CourtUser
                        name={player.name}
                        elo={player.elo}
                        team="A"
                        isConfirmed={true}
                      />
                      {player.id === currentUserId && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                          VOCÊ
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team B */}
            <div className="rounded-2xl bg-gray-900/80 border-2 border-red-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600/20 to-red-500/10 px-4 py-2.5 border-b border-red-500/20">
                <p className="text-sm font-bold text-red-400 uppercase tracking-wide">
                  Dupla B
                </p>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap justify-center gap-3">
                  {teamBPlayers.map((player) => (
                    <div key={player.id} className="relative">
                      <CourtUser
                        name={player.name}
                        elo={player.elo}
                        team="B"
                        isConfirmed={true}
                      />
                      {player.id === currentUserId && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                          VOCÊ
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Unassigned Players - Only show if there are any */}
            {unassignedPlayers.length > 0 && (
              <div className="rounded-2xl bg-gray-900/80 border-2 border-gray-600/30 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-600/20 to-gray-500/10 px-4 py-2.5 border-b border-gray-600/20">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                    Sem Dupla
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap justify-center gap-3">
                    {unassignedPlayers.map((player) => (
                      <div key={player.id} className="relative">
                        <CourtUser
                          name={player.name}
                          elo={player.elo}
                          isConfirmed={true}
                        />
                        {player.id === currentUserId && (
                          <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                            VOCÊ
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Bottom spacing for chat button */}
          <div className="h-4" />
        </div>

        <ChatButton
          setIsChatOpen={() => {
            setIsChatOpen(true);
          }}
        />
        <GameChat
          isChatOpen={isChatOpen}
          setIsChatOpen={() => {
            setIsChatOpen(false);
          }}
        />
      </section>
    );
  }

  return (
    <section className="relative flex h-full w-full flex-col bg-gray-900">
      <div className="relative z-10 shrink-0 bg-gray-900/95 py-3 text-center text-white shadow-lg">
        <button
          onClick={() => navigate("/app")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Jogo #{lobby.id}</h1>
        <p className="text-sm text-gray-300">
          {lobby.club.name}, {lobby.club.neighbourhood} •{" "}
          {formatTime(lobby.startTime)}
        </p>
        {/* Status badges */}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              lobby.isCourtScheduled
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {lobby.isCourtScheduled
              ? "✓ Reserva Confirmada"
              : "⚠ Reserva Pendente"}
          </span>
          {allPlayersConfirmed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
              ✓ Todos Confirmados
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-400">
              ⚠ Jogadores pendentes
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-3 py-5">
        {/* Team A */}
        <div className="mb-2 flex items-center justify-between">
          <p className="flex-1 text-start font-semibold text-white">Dupla A</p>
          <motion.button
            onClick={() => assignCurrentUserToTeam("A")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600 active:bg-blue-700"
            aria-label="Entrar na Dupla A"
          >
            <UserPlus className="h-5 w-5" />
          </motion.button>
        </div>
        <div className="min-h-[80px] w-full rounded-lg border-2 border-blue-500 bg-blue-500/10 p-3">
          <div className="flex flex-wrap justify-center gap-3">
            <AnimatePresence mode="popLayout">
              {teamAPlayers.map((player) => {
                const isCurrentUser = player.id === currentUserId;
                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    onClick={
                      isCurrentUser
                        ? () => assignCurrentUserToTeam("unassigned")
                        : undefined
                    }
                    className={isCurrentUser ? "cursor-pointer" : ""}
                  >
                    <CourtUser
                      name={player.name}
                      elo={player.elo}
                      team="A"
                      isConfirmed={confirmedPlayers.has(player.id)}
                    />
                    {isCurrentUser && (
                      <p className="mt-1 text-center text-xs text-blue-300">
                        (Você)
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {teamAPlayers.length === 0 && (
              <p className="py-4 text-sm text-gray-400">
                Nenhum jogador na dupla A
              </p>
            )}
          </div>
        </div>

        <Spacer height={20} />

        {/* Team B */}
        <div className="mb-2 flex items-center justify-between">
          <p className="flex-1 text-start font-semibold text-white">Dupla B</p>
          <motion.button
            onClick={() => assignCurrentUserToTeam("B")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600 active:bg-red-700"
            aria-label="Entrar na Dupla B"
          >
            <UserPlus className="h-5 w-5" />
          </motion.button>
        </div>
        <div className="min-h-[80px] w-full rounded-lg border-2 border-red-500 bg-red-500/10 p-3">
          <div className="flex flex-wrap justify-center gap-3">
            <AnimatePresence mode="popLayout">
              {teamBPlayers.map((player) => {
                const isCurrentUser = player.id === currentUserId;
                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    onClick={
                      isCurrentUser
                        ? () => assignCurrentUserToTeam("unassigned")
                        : undefined
                    }
                    className={isCurrentUser ? "cursor-pointer" : ""}
                  >
                    <CourtUser
                      name={player.name}
                      elo={player.elo}
                      team="B"
                      isConfirmed={confirmedPlayers.has(player.id)}
                    />
                    {isCurrentUser && (
                      <p className="mt-1 text-center text-xs text-red-300">
                        (Você)
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {teamBPlayers.length === 0 && (
              <p className="py-4 text-sm text-gray-400">
                Nenhum jogador na dupla B
              </p>
            )}
          </div>
        </div>

        <Spacer height={20} />

        {/* Unassigned Players */}
        <p className="text-start font-semibold text-white">
          Jogadores sem dupla
        </p>
        <Spacer height={8} />
        <div className="min-h-[80px] w-full rounded-lg border-2 border-gray-600 bg-gray-800/30 p-3">
          <div className="flex flex-wrap justify-center gap-3">
            <AnimatePresence mode="popLayout">
              {unassignedPlayers.map((player) => {
                const isCurrentUser = player.id === currentUserId;
                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  >
                    <CourtUser
                      name={player.name}
                      elo={player.elo}
                      isConfirmed={confirmedPlayers.has(player.id)}
                    />
                    {isCurrentUser && (
                      <p className="mt-1 text-center text-xs text-gray-300">
                        (Você)
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {unassignedPlayers.length === 0 && (
              <p className="py-4 text-sm text-gray-400">
                Todos os jogadores foram alocados
              </p>
            )}
          </div>
        </div>

        <Spacer height={20} />

        {/* Confirmation button - hide when match is scheduled and all players confirmed */}
        {!(lobby.isCourtScheduled && allPlayersConfirmed) && (
          <motion.button
            onClick={toggleConfirmation}
            animate={{
              backgroundColor: isUserConfirmed ? "#dc2626" : "#16a34a",
            }}
            whileHover={{
              backgroundColor: isUserConfirmed ? "#b91c1c" : "#15803d",
            }}
            whileTap={{
              scale: 0.98,
            }}
            transition={{
              backgroundColor: { duration: 0.3, ease: "easeInOut" },
              scale: { duration: 0.1 },
            }}
            className="w-full text-center rounded-lg px-4 py-3 font-semibold text-white"
          >
            {isUserConfirmed ? "Cancelar Confirmação" : "Confirmar Presença"}
          </motion.button>
        )}
      </div>

      <ChatButton
        setIsChatOpen={() => {
          setIsChatOpen(true);
        }}
      />
      <GameChat
        isChatOpen={isChatOpen}
        setIsChatOpen={() => {
          setIsChatOpen(false);
        }}
      />
    </section>
  );
};

export default Lobby;
