import ChatButton from "@/components/ChatButton";
import GameChat from "@/components/GameChat";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Check, UserPlus } from "lucide-react";
import CourtUser from "@/components/Lobby/CourtUser";
import Spacer from "@/components/Spacer";
import { motion, AnimatePresence } from "motion/react";

// Mock lobby data - will be replaced with API call
const mockLobbies = {
  "1": {
    id: "1",
    club: { name: "Padel Center Lisboa", neighbourhood: "Alvalade" },
    category: 3,
    startTime: new Date(2025, 9, 5, 18, 0),
    endTime: new Date(2025, 9, 5, 19, 30),
    currentPlayers: 2,
    maxPlayers: 4,
    isCourtScheduled: true,
    players: [
      {
        id: "1",
        name: "vlapa1",
        elo: 1000,
        team: "A" as const,
        position: "left" as const,
      },
      {
        id: "2",
        name: "jn02",
        elo: 950,
        team: "A" as const,
        position: "right" as const,
      },
      {
        id: "3",
        name: "dka01",
        elo: 1100,
        team: "B" as const,
        position: "left" as const,
      },
      {
        id: "4",
        name: "tmm12",
        elo: 980,
        team: "B" as const,
        position: "right" as const,
      },
    ],
  },
  "2": {
    id: "2",
    club: { name: "Sports Club Cascais", neighbourhood: "Cascais" },
    category: 5,
    startTime: new Date(2025, 9, 5, 20, 0),
    endTime: new Date(2025, 9, 5, 21, 30),
    currentPlayers: 3,
    maxPlayers: 4,
    isCourtScheduled: false,
    players: [
      {
        id: "5",
        name: "player1",
        elo: 1200,
        team: "A" as const,
        position: "left" as const,
      },
      {
        id: "6",
        name: "player2",
        elo: 1150,
        team: "A" as const,
        position: "right" as const,
      },
      {
        id: "7",
        name: "player3",
        elo: 1300,
        team: "B" as const,
        position: "left" as const,
      },
    ],
  },
  "3": {
    id: "3",
    club: { name: "Padel Premium Sintra", neighbourhood: "Sintra" },
    category: 2,
    startTime: new Date(2025, 9, 6, 10, 0),
    endTime: new Date(2025, 9, 6, 11, 30),
    currentPlayers: 1,
    maxPlayers: 4,
    isCourtScheduled: true,
    players: [
      {
        id: "8",
        name: "solo",
        elo: 800,
        team: "A" as const,
        position: "left" as const,
      },
    ],
  },
};

interface PlayerAssignment {
  playerId: string;
  team: "A" | "B" | "unassigned";
  position?: "left" | "right";
}

const Lobby = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [confirmedPlayers, setConfirmedPlayers] = useState<Set<string>>(
    new Set(["1", "3"]) // Mock: vlapa1 and dka01 are already confirmed
  );
  const [currentUserId] = useState("1"); // Mock: current user is vlapa1

  // Team assignments state - will come from backend API
  // Mock data: some players already assigned
  const [playerAssignments, setPlayerAssignments] = useState<
    Map<string, PlayerAssignment>
  >(
    new Map([
      ["2", { playerId: "2", team: "A" }],
      ["3", { playerId: "3", team: "B" }],
      ["4", { playerId: "4", team: "B" }],
    ])
  );

  // Get lobby data from mock or show not found
  const lobby = lobbyId
    ? mockLobbies[lobbyId as keyof typeof mockLobbies]
    : null;

  if (!lobby) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <h1 className="mb-4 text-2xl">Lobby não encontrado</h1>
        <button
          onClick={() => navigate("/app")}
          className="text-blue-400 hover:underline"
        >
          Voltar para lobbies
        </button>
      </div>
    );
  }

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
    // TODO: Call backend API to update team assignment
  };

  const teamAPlayers = getPlayersByTeam("A");
  const teamBPlayers = getPlayersByTeam("B");
  const unassignedPlayers = getPlayersByTeam("unassigned");

  // Check if all players are confirmed
  const allPlayersConfirmed =
    lobby?.players?.length > 0 &&
    lobby.players.every((player) => confirmedPlayers.has(player.id));

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

        {/* Confirmation button */}
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
