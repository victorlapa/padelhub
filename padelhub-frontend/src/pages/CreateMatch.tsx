import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { ArrowLeft, MapPin, Users, Calendar, Clock, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClubs, createClub, createMatch } from "@/services/api";

export default function CreateMatch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = React.useState({
    clubId: "",
    newClubName: "",
    newClubAddress: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    courtId: "",
  });
  const [isCreatingNewClub, setIsCreatingNewClub] = React.useState(false);

  // Fetch clubs
  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: getClubs,
  });

  // Create club mutation
  const createClubMutation = useMutation({
    mutationFn: createClub,
    onSuccess: (newClub) => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setFormData((prev) => ({ ...prev, clubId: newClub.id }));
      setIsCreatingNewClub(false);
      alert("Clube criado com sucesso!");
    },
    onError: (error: Error) => {
      alert(`Erro ao criar clube: ${error.message}`);
    },
  });

  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      alert("Partida criada com sucesso!");
      navigate("/app");
    },
    onError: (error: Error) => {
      alert(`Erro ao criar partida: ${error.message}`);
    },
  });

  const handleCreateNewClub = async () => {
    if (!formData.newClubName || !formData.newClubAddress) {
      alert("Por favor, preencha o nome e endereço do clube");
      return;
    }

    createClubMutation.mutate({
      name: formData.newClubName,
      address: formData.newClubAddress,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.clubId) {
      alert("Por favor, selecione um clube");
      return;
    }
    if (!formData.category || !formData.date || !formData.startTime || !formData.endTime) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Combine date and time into ISO string
    const startDate = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
    const endDate = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();

    const matchData = {
      clubId: formData.clubId,
      courtId: formData.courtId || undefined,
      startDate,
      endDate,
      category: parseInt(formData.category),
      status: "PENDING" as const,
      isCourtScheduled: false,
    };

    createMatchMutation.mutate(matchData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Redirect if not authenticated (only in production)
  React.useEffect(() => {
    if (!user && !import.meta.env.DEV) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="bg-background text-foreground min-h-screen w-full p-5">
      <div className="mx-auto max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/app")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Criar Nova Partida</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Club Information */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5" />
                  Informações do Clube
                </h3>

                {!isCreatingNewClub ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="clubId">Selecione o Clube</Label>
                      <Select
                        value={formData.clubId}
                        onValueChange={(value) => handleChange("clubId", value)}
                        required
                        disabled={isLoadingClubs}
                      >
                        <SelectTrigger id="clubId">
                          <SelectValue placeholder={isLoadingClubs ? "Carregando..." : "Selecione um clube"} />
                        </SelectTrigger>
                        <SelectContent>
                          {clubs.map((club) => (
                            <SelectItem key={club.id} value={club.id}>
                              {club.name} - {club.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatingNewClub(true)}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Novo Clube
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newClubName">Nome do Novo Clube</Label>
                      <Input
                        id="newClubName"
                        placeholder="Ex: Padel Center Joinville"
                        value={formData.newClubName}
                        onChange={(e) => handleChange("newClubName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newClubAddress">Endereço do Clube</Label>
                      <Input
                        id="newClubAddress"
                        placeholder="Ex: Rua das Palmeiras, 123"
                        value={formData.newClubAddress}
                        onChange={(e) => handleChange("newClubAddress", e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleCreateNewClub}
                        disabled={createClubMutation.isPending}
                        className="flex-1"
                      >
                        {createClubMutation.isPending ? "Criando..." : "Salvar Clube"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreatingNewClub(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="courtId">Quadra (Opcional)</Label>
                  <Input
                    id="courtId"
                    placeholder="Ex: Quadra 1, Court A"
                    value={formData.courtId}
                    onChange={(e) => handleChange("courtId", e.target.value)}
                  />
                </div>
              </div>

              {/* Match Details */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5" />
                  Detalhes da Partida
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((cat) => (
                        <SelectItem key={cat} value={cat.toString()}>
                          Categoria {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5" />
                  Data e Horário
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">
                      <Clock className="mr-1 inline h-4 w-4" />
                      Hora de Início
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => handleChange("startTime", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">
                      <Clock className="mr-1 inline h-4 w-4" />
                      Hora de Término
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => handleChange("endTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/app")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMatchMutation.isPending}
                  className="flex-1"
                >
                  {createMatchMutation.isPending ? "Criando..." : "Criar Partida"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}