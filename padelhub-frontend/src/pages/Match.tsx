import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Trophy,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserMatches, type Match as MatchType } from "@/services/api";

export default function Match() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Fetch user's matches
  const {
    data: matches = [],
    isLoading: isMatchesLoading,
    error,
  } = useQuery({
    queryKey: ["userMatches", user?.id],
    queryFn: () => getUserMatches(user!.id),
    enabled: !!user?.id,
  });

  React.useEffect(() => {
    if (!user && !isAuthLoading) {
      navigate("/");
    }
  }, [user, isAuthLoading, navigate]);

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

  // Determine match status based on dates and backend status
  const getMatchStatus = (
    match: MatchType
  ): "upcoming" | "completed" | "in_progress" => {
    const now = new Date();
    const startDate = new Date(match.startDate);
    const endDate = new Date(match.endDate);

    if (match.status === "COMPLETED" || match.status === "CANCELLED") {
      return "completed";
    }

    if (now >= startDate && now <= endDate) {
      return "in_progress";
    }

    if (now < startDate) {
      return "upcoming";
    }

    return "completed";
  };

  const completedMatches = matches.filter(
    (m) => getMatchStatus(m) === "completed"
  );
  const upcomingMatches = matches.filter(
    (m) => getMatchStatus(m) === "upcoming"
  );
  const inProgressMatches = matches.filter(
    (m) => getMatchStatus(m) === "in_progress"
  );

  const getStatusBadge = (match: MatchType) => {
    const status = getMatchStatus(match);

    if (status === "completed") {
      if (match.status === "COMPLETED") {
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Concluído
          </Badge>
        );
      } else if (match.status === "CANCELLED") {
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelado
          </Badge>
        );
      }
      return (
        <Badge className="bg-gray-500 hover:bg-gray-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Finalizado
        </Badge>
      );
    }

    if (status === "in_progress") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <Clock className="mr-1 h-3 w-3" />
          Em Andamento
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-500 hover:bg-blue-600">
        <Clock className="mr-1 h-3 w-3" />
        Agendado
      </Badge>
    );
  };

  // Loading state
  if (isAuthLoading || isMatchesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando partidas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-semibold mb-2">
            Erro ao carregar partidas
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </p>
          <button
            onClick={() => navigate("/app")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen w-full p-5">
      <div className="mx-auto max-w-6xl py-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Minhas Partidas</h1>
          <p className="text-muted-foreground">
            Acompanhe seu histórico e próximas partidas
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
              <p className="text-2xl font-bold">{matches.length}</p>
              <p className="text-muted-foreground text-sm">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <p className="text-2xl font-bold">
                {
                  completedMatches.filter((m) => m.status === "COMPLETED")
                    .length
                }
              </p>
              <p className="text-muted-foreground text-sm">Concluídas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-blue-500" />
              <p className="text-2xl font-bold">{upcomingMatches.length}</p>
              <p className="text-muted-foreground text-sm">Agendadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Próximas Partidas</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingMatches.map((match) => (
                <Card
                  key={match.matchId}
                  className="cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => navigate(`/app/lobby/${match.matchId}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{match.club.name}</span>
                      {getStatusBadge(match)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span>{match.club.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>{formatDate(new Date(match.startDate))}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span>
                        {formatTime(new Date(match.startDate))} -{" "}
                        {formatTime(new Date(match.endDate))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <span>{match.matchPlayers.length} jogadores</span>
                      </div>
                      <span className="text-primary rounded-full bg-primary/10 px-3 py-1 text-xs font-bold">
                        Cat. {match.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Matches */}
        {completedMatches.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Histórico</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completedMatches.map((match) => (
                <Card
                  key={match.matchId}
                  className="cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => navigate(`/app/lobby/${match.matchId}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{match.club.name}</span>
                      {getStatusBadge(match)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span>{match.club.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>{formatDate(new Date(match.startDate))}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span>
                        {formatTime(new Date(match.startDate))} -{" "}
                        {formatTime(new Date(match.endDate))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <span>{match.matchPlayers.length} jogadores</span>
                      </div>
                      <span className="text-primary rounded-full bg-primary/10 px-3 py-1 text-xs font-bold">
                        Cat. {match.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {matches.length === 0 && (
          <div className="text-muted-foreground py-12 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 opacity-50" />
            <p className="mb-2 text-lg">Nenhuma partida encontrada</p>
            <p className="text-sm">
              Suas partidas aparecerão aqui assim que você participar de alguma
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
