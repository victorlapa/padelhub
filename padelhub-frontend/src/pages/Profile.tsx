import { Card } from "@/components/ui/card";
import { User, Mail, Calendar, Trophy, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

// Development mode flag
const USE_MOCK_USER = import.meta.env.DEV;

// Mock user for development
const mockUser = {
  id: "dev-user-1",
  email: "dev@padelhub.com",
  name: "Desenvolvedor",
  picture: undefined,
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, isLoading } = useAuth();

  // Use mock user in development mode if no auth session exists
  const user = authUser || (USE_MOCK_USER ? mockUser : null);

  React.useEffect(() => {
    if (!user && !isLoading && !USE_MOCK_USER) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
          <p className="text-gray-600">Gerencie as suas informações pessoais</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 p-6">
          <div className="flex flex-col items-center text-center">
            {/* Profile Image */}
            <div className="mb-4">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "Utilizador"}
                  className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-300">
                  <User className="h-12 w-12 text-gray-600" />
                </div>
              )}
            </div>

            {/* User Info */}
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.name || "Nome não disponível"}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </Card>

        {/* User Details */}
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Informações Pessoais
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-gray-600">
                  {user?.email || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Nome</p>
                <p className="text-gray-600">{user?.name || "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Telefone</p>
                <p className="text-gray-600">Não informado</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Localização</p>
                <p className="text-gray-600">Não informado</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Game Stats */}
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Estatísticas de Jogo
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <p className="text-2xl font-bold text-gray-900">1000</p>
              </div>
              <p className="text-sm text-gray-600">ELO Rating</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <p className="text-sm text-gray-600">Jogos Realizados</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
