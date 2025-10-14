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
} from "lucide-react";

// Development mode flag
const USE_MOCK_USER = import.meta.env.DEV;

// Mock user for development
const mockUser = {
  id: "dev-user-1",
  email: "dev@padelhub.com",
  name: "Desenvolvedor",
  picture: undefined,
};

// Mock matches data - will be replaced with API call
const mockMatches = [
  {
    id: "1",
    club: { name: "Padel Center Lisboa", neighbourhood: "Alvalade" },
    category: 3,
    date: new Date(2025, 8, 15, 18, 0),
    endTime: new Date(2025, 8, 15, 19, 30),
    status: "completed",
    result: "win",
    players: 4,
    score: "6-4, 6-3",
  },
  {
    id: "2",
    club: { name: "Sports Club Cascais", neighbourhood: "Cascais" },
    category: 5,
    date: new Date(2025, 8, 20, 20, 0),
    endTime: new Date(2025, 8, 20, 21, 30),
    status: "completed",
    result: "loss",
    players: 4,
    score: "4-6, 3-6",
  },
  {
    id: "3",
    club: { name: "Padel Premium Sintra", neighbourhood: "Sintra" },
    category: 2,
    date: new Date(2025, 9, 5, 10, 0),
    endTime: new Date(2025, 9, 5, 11, 30),
    status: "upcoming",
    result: null,
    players: 4,
    score: null,
  },
  {
    id: "4",
    club: { name: "Padel Center Lisboa", neighbourhood: "Alvalade" },
    category: 4,
    date: new Date(2025, 9, 8, 19, 0),
    endTime: new Date(2025, 9, 8, 20, 30),
    status: "upcoming",
    result: null,
    players: 4,
    score: null,
  },
];

export default function Match() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // Use mock user in development mode if no auth session exists
  const user = authUser || (USE_MOCK_USER ? mockUser : null);

  React.useEffect(() => {
    if (!user && !USE_MOCK_USER) {
      navigate("/");
    }
  }, [user, navigate]);

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

  const completedMatches = mockMatches.filter((m) => m.status === "completed");
  const upcomingMatches = mockMatches.filter((m) => m.status === "upcoming");

  const getStatusBadge = (status: string, result: string | null) => {
    if (status === "completed") {
      if (result === "win") {
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Vitória
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="mr-1 h-3 w-3" />
            Derrota
          </Badge>
        );
      }
    }
    return (
      <Badge className="bg-blue-500 hover:bg-blue-600">
        <Clock className="mr-1 h-3 w-3" />
        Agendado
      </Badge>
    );
  };

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
              <p className="text-2xl font-bold">{mockMatches.length}</p>
              <p className="text-muted-foreground text-sm">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <p className="text-2xl font-bold">
                {completedMatches.filter((m) => m.result === "win").length}
              </p>
              <p className="text-muted-foreground text-sm">Vitórias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
              <p className="text-2xl font-bold">
                {completedMatches.filter((m) => m.result === "loss").length}
              </p>
              <p className="text-muted-foreground text-sm">Derrotas</p>
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
                  key={match.id}
                  className="cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => navigate(`/app/lobby/${match.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{match.club.name}</span>
                      {getStatusBadge(match.status, match.result)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span>{match.club.neighbourhood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>{formatDate(match.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span>
                        {formatTime(match.date)} - {formatTime(match.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <span>{match.players} jogadores</span>
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
                  key={match.id}
                  className="cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => navigate(`/app/lobby/${match.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{match.club.name}</span>
                      {getStatusBadge(match.status, match.result)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span>{match.club.neighbourhood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>{formatDate(match.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span>
                        {formatTime(match.date)} - {formatTime(match.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy className="text-muted-foreground h-4 w-4" />
                        <span className="font-semibold">{match.score}</span>
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
        {mockMatches.length === 0 && (
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
