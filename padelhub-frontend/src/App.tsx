import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import React from "react";
import { MapPin, Users, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import ProfileBar from "@/components/ProfileBar";

// Development mode flag - set to true to use mock user data
const USE_MOCK_USER = import.meta.env.DEV;

// Mock user for development
const mockUser = {
  id: "dev-user-1",
  email: "dev@padelhub.com",
  name: "Desenvolvedor",
  picture: undefined,
};

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

  // Use mock user in development mode if no auth session exists
  const activeUser = user || (USE_MOCK_USER ? mockUser : null);

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

  const filteredLobbies =
    selectedCategory === null
      ? mockLobbies
      : mockLobbies.filter((lobby) => lobby.category === selectedCategory);

  return (
    <div className="bg-background text-foreground min-h-screen w-full p-5">
      {activeUser && (
        <>
          <ProfileBar
            elo={1000}
            userName={activeUser.name || "Usuário"}
            maxElo={2000}
          />
          <div className="py-8">
            <div className="mx-auto max-w-6xl pb-3">
              <div className="mb-8 flex items-center justify-center gap-2">
                <MapPin className="h-6 w-6" />
                <h2 className="text-2xl font-semibold">Joinville</h2>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Partidas Disponíveis</h2>
                <Button onClick={() => navigate("/app/create-match")}>
                  Criar Nova Partida
                </Button>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
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

              <div className="max-h-[380px] overflow-y-auto pr-2">
                <div className="grid gap-4 pb-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLobbies.map((lobby) => (
                    <motion.div
                      key={lobby.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-lg">{lobby.club.name}</span>
                            <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-sm font-bold">
                              Cat. {lobby.category}
                            </span>
                          </CardTitle>
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
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="text-muted-foreground h-4 w-4" />
                            <span>
                              {lobby.currentPlayers}/{lobby.maxPlayers}{" "}
                              jogadores
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
