import ChatButton from "@/components/ChatButton";
import GameChat from "@/components/GameChat";
import Court from "@/components/Lobby/Court";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

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
  },
  "2": {
    id: "2",
    club: { name: "Sports Club Cascais", neighbourhood: "Cascais" },
    category: 5,
    startTime: new Date(2025, 9, 5, 20, 0),
    endTime: new Date(2025, 9, 5, 21, 30),
    currentPlayers: 3,
    maxPlayers: 4,
  },
  "3": {
    id: "3",
    club: { name: "Padel Premium Sintra", neighbourhood: "Sintra" },
    category: 2,
    startTime: new Date(2025, 9, 6, 10, 0),
    endTime: new Date(2025, 9, 6, 11, 30),
    currentPlayers: 1,
    maxPlayers: 4,
  },
};

const Lobby = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  return (
    <div className="relative flex h-screen w-full flex-col bg-gray-900">
      <div className="relative z-10 shrink-0 bg-gray-900/95 py-3 text-center text-white shadow-lg">
        <button
          onClick={() => navigate("/app")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Jogo #{lobby.id}</h1>
        <p className="text-sm text-gray-300">
          {lobby.club.name}, {lobby.club.neighbourhood} • {formatTime(lobby.startTime)}
        </p>
      </div>
      <div className="relative flex-1">
        <Court />
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
    </div>
  );
};

export default Lobby;
