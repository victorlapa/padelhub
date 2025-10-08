import ChatButton from "@/components/ChatButton";
import GameChat from "@/components/GameChat";
import Court from "@/components/Lobby/Court";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Check } from "lucide-react";
import CourtUser from "@/components/Lobby/CourtUser";
import Spacer from "@/components/Spacer";

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

const Lobby = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [confirmedPlayers, setConfirmedPlayers] = useState<Set<string>>(
    new Set(["1", "3"]) // Mock: vlapa1 and dka01 are already confirmed
  );
  const [currentUserId] = useState("1"); // Mock: current user is vlapa1

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
      </div>
      <div className="px-3 py-5 flex-col flex ">
        <p className="text-center text-white">Dupla 1</p>
        <div className="flex w-full gap-4 rounded-full border-2 border-blue-500 justify-center p-2">
          <CourtUser />
        </div>
        <Spacer height={20} />
        <p className="text-center text-white">Dupla 2</p>
        <div className="flex w-full gap-4 rounded-full border-2 border-red-500 justify-center p-2">
          <CourtUser />
        </div>
        <Spacer height={20} />
        <p className="text-center text-white">Jogadores sem dupla</p>
        <div className="flex w-full gap-4 rounded-full justify-center p-2">
          <CourtUser />
          <CourtUser />
        </div>
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
