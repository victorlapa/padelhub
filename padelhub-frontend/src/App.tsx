import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import React from "react";
import { MapPin, Users, Calendar, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import ProfileBar from "@/components/ProfileBar";
import { useQuery } from "@tanstack/react-query";
import { getMatches } from "@/services/api";

export default function App() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(
    null
  );

  // Fetch matches from API
  const { data: matches = [], isLoading, error } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter only pending matches
  const pendingMatches = matches.filter((match) => match.status === "PENDING");

  // Sort matches by date/time
  const sortedMatches = [...pendingMatches].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const filteredMatches =
    selectedCategory === null
      ? sortedMatches
      : sortedMatches.filter((match) => match.category === selectedCategory);

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

              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2">Carregando partidas...</span>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="text-red-600 py-12 text-center">
                  <p className="mb-4 text-lg">
                    Erro ao carregar partidas. Tente novamente.
                  </p>
                </div>
              )}

              {/* Matches list */}
              {!isLoading && !error && (
                <>
                  <div className="mt-6">
                    <div className="grid gap-4 pb-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredMatches.map((match) => {
                        const maxPlayers = 4;
                        const currentPlayers = match.matchPlayers.length;
                        const isFull = currentPlayers >= maxPlayers;

                        return (
                          <motion.div
                            key={match.matchId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card
                              className="cursor-pointer transition-shadow hover:shadow-lg"
                              onClick={() => navigate(`/app/lobby/${match.matchId}`)}
                            >
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                  <span className="text-lg">{match.club.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-sm font-bold">
                                      Cat. {match.category}
                                    </span>
                                  </div>
                                </CardTitle>
                                {/* Prominent availability badge */}
                                <div className="mt-2 flex items-center gap-2">
                                  <div
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                                      isFull
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    <Users className="h-4 w-4" />
                                    <span>
                                      {currentPlayers}/{maxPlayers}
                                    </span>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="text-muted-foreground h-4 w-4" />
                                  <span>{match.club.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="text-muted-foreground h-4 w-4" />
                                  <span>{formatDate(match.startDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="text-muted-foreground h-4 w-4" />
                                  <span>
                                    {formatTime(match.startDate)} -{" "}
                                    {formatTime(match.endDate)}
                                  </span>
                                </div>
                                <Button
                                  className="mt-4 w-full"
                                  variant={isFull ? "secondary" : "default"}
                                  disabled={isFull}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/app/lobby/${match.matchId}`);
                                  }}
                                >
                                  {isFull ? "Partida Cheia" : "Entrar"}
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {filteredMatches.length === 0 && (
                    <div className="text-muted-foreground py-12 text-center">
                      <p className="mb-4 text-lg">
                        Nenhuma partida disponível no momento
                      </p>
                      <Button onClick={() => navigate("/app/create-match")}>
                        Criar a Primeira Partida
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
