import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import React from "react";
import { MapPin, Users, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import ProfileBar from "@/components/ProfileBar";


// Mock data - will be replaced with API call
const mockLobbies = [
  {
    id: "1",
    club: { name: "Padel Center Lisboa", neighbourhood: "Alvalade" },
    category: 3,
    startTime: new Date(2025, 9, 5, 18, 0),
    endTime: new Date(2025, 9, 5, 19, 30),
    currentPlayers: 2,
    maxPlayers: 4,
  },
  {
    id: "2",
    club: { name: "Sports Club Cascais", neighbourhood: "Cascais" },
    category: 5,
    startTime: new Date(2025, 9, 5, 20, 0),
    endTime: new Date(2025, 9, 5, 21, 30),
    currentPlayers: 3,
    maxPlayers: 4,
  },
  {
    id: "3",
    club: { name: "Padel Premium Sintra", neighbourhood: "Sintra" },
    category: 2,
    startTime: new Date(2025, 9, 6, 10, 0),
    endTime: new Date(2025, 9, 6, 11, 30),
    currentPlayers: 1,
    maxPlayers: 4,
  },
];

export default function App() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(
    null
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort lobbies by date/time
  const sortedLobbies = [...mockLobbies].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  const filteredLobbies =
    selectedCategory === null
      ? sortedLobbies
      : sortedLobbies.filter((lobby) => lobby.category === selectedCategory);

  return (
    <div className="bg-background text-foreground min-h-screen w-full p-5">
      {user && (
        <>
          <ProfileBar
            elo={user.category ? user.category * 100 : 800}
            userName={`${user.firstName} ${user.lastName}`}
            maxElo={2000}
            profilePictureUrl={user.profilePictureUrl}
          />
          <div className="py-8">
            <div className="mx-auto max-w-6xl pb-3">
              <div className="mb-8 flex items-center justify-center gap-2">
                <MapPin className="h-6 w-6" />
                <h2 className="text-2xl font-semibold">{user.city || "Sua Cidade"}</h2>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Partidas Disponíveis</h2>
                <Button onClick={() => navigate("/app/create-match")}>
                  Criar Nova Partida
                </Button>
              </div>

              {/* Sticky filter bar */}
              <div className="sticky top-0 z-10 -mx-5 bg-background px-5 py-3 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Todas
                  </Button>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      Cat. {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Full page scroll - removed fixed height */}
              <div className="mt-6">
                <div className="grid gap-4 pb-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLobbies.map((lobby) => (
                    <motion.div
                      key={lobby.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="cursor-pointer transition-shadow hover:shadow-lg"
                        onClick={() => navigate(`/app/lobby/${lobby.id}`)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between gap-2">
                            <span className="text-lg">{lobby.club.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-sm font-bold">
                                Cat. {lobby.category}
                              </span>
                            </div>
                          </CardTitle>
                          {/* Prominent availability badge */}
                          <div className="mt-2 flex items-center gap-2">
                            <div
                              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                                lobby.currentPlayers >= lobby.maxPlayers
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              <Users className="h-4 w-4" />
                              <span>
                                {lobby.currentPlayers}/{lobby.maxPlayers}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="text-muted-foreground h-4 w-4" />
                            <span>{lobby.club.neighbourhood}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            <span>{formatDate(lobby.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <span>
                              {formatTime(lobby.startTime)} -{" "}
                              {formatTime(lobby.endTime)}
                            </span>
                          </div>
                          <Button
                            className="mt-4 w-full"
                            variant={
                              lobby.currentPlayers >= lobby.maxPlayers
                                ? "secondary"
                                : "default"
                            }
                            disabled={lobby.currentPlayers >= lobby.maxPlayers}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/app/lobby/${lobby.id}`);
                            }}
                          >
                            {lobby.currentPlayers >= lobby.maxPlayers
                              ? "Partida Cheia"
                              : "Entrar"}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {filteredLobbies.length === 0 && (
                <div className="text-muted-foreground py-12 text-center">
                  <p className="mb-4 text-lg">
                    Nenhuma partida disponível no momento
                  </p>
                  <Button onClick={() => navigate("/create-match")}>
                    Criar a Primeira Partida
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
