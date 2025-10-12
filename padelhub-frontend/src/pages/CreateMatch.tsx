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
import { ArrowLeft, MapPin, Users, Calendar, Clock } from "lucide-react";

export default function CreateMatch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    clubName: "",
    neighbourhood: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    maxPlayers: "4",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Replace with actual API call
    console.log("Creating match with data:", formData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Navigate back to app page
    navigate("/app");
    setIsSubmitting(false);
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

                <div className="space-y-2">
                  <Label htmlFor="clubName">Nome do Clube</Label>
                  <Input
                    id="clubName"
                    required
                    placeholder="Ex: Padel Center Lisboa"
                    value={formData.clubName}
                    onChange={(e) => handleChange("clubName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighbourhood">Bairro/Localização</Label>
                  <Input
                    id="neighbourhood"
                    required
                    placeholder="Ex: Alvalade"
                    value={formData.neighbourhood}
                    onChange={(e) =>
                      handleChange("neighbourhood", e.target.value)
                    }
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

                <div className="space-y-2">
                  <Label htmlFor="maxPlayers">Número Máximo de Jogadores</Label>
                  <Select
                    value={formData.maxPlayers}
                    onValueChange={(value) => handleChange("maxPlayers", value)}
                    required
                  >
                    <SelectTrigger id="maxPlayers">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 jogadores</SelectItem>
                      <SelectItem value="4">4 jogadores</SelectItem>
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
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Criando..." : "Criar Partida"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}