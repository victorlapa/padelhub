import { Card } from "@/components/ui/card";
import { User, Mail, Calendar, Trophy, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import React from "react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!user && !isLoading) {
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

  const proxiedImageUrl = getProxiedImageUrl(user.profilePictureUrl);

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
              {proxiedImageUrl ? (
                <img
                  src={proxiedImageUrl}
                  alt={`${user.firstName} ${user.lastName}`}
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
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">{user.email}</p>
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
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Nome Completo</p>
                <p className="text-gray-600">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Telefone</p>
                <p className="text-gray-600">{user.phone || "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Localização</p>
                <p className="text-gray-600">{user.city || "Não informado"}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {user.category ? user.category * 100 : 800}
                </p>
              </div>
              <p className="text-sm text-gray-600">ELO Rating</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <p className="text-2xl font-bold text-gray-900">
                  {/* TODO: Add matchesPlayed from backend when available */}
                  0
                </p>
              </div>
              <p className="text-sm text-gray-600">Jogos Realizados</p>
            </div>

            <div className="text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-2xl font-bold text-gray-900">
                  Cat. {user.category || "N/A"}
                </div>
                <p className="text-sm text-gray-600">Categoria</p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-2xl font-bold text-gray-900">
                  {user.sidePreference
                    ? user.sidePreference === "left"
                      ? "Esquerda"
                      : "Direita"
                    : "N/A"}
                </div>
                <p className="text-sm text-gray-600">Lado Preferido</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
