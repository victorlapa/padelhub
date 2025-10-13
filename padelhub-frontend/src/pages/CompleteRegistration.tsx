import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { completeUserRegistration, type CompleteRegistrationDto } from "@/services/api";

export default function CompleteRegistration() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CompleteRegistrationDto>(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    city: user?.city || "",
    category: user?.category || 8,
    sidePreference: user?.sidePreference,
  }));

  const mutation = useMutation({
    mutationFn: async (data: CompleteRegistrationDto) => {
      const token = localStorage.getItem("authToken");
      if (!token || !user) {
        throw new Error("No authentication token found");
      }
      return completeUserRegistration(user.id, data, token);
    },
    onSuccess: (updatedUser) => {
      // Update user in context
      updateUser(updatedUser);
      // Navigate to app
      navigate("/app");
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      alert(error.message || "Failed to complete registration");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.city || formData.category === undefined) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    mutation.mutate(formData);
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-800">
            Complete seu Perfil
          </h1>
          <p className="text-gray-600">
            Precisamos de mais algumas informações para começar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="João"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sobrenome *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Silva"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Telefone *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="(11) 98765-4321"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cidade *
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="São Paulo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Categoria (1-10) *
            </label>
            <input
              type="number"
              id="category"
              min="1"
              max="10"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Avalie seu nível de habilidade de 1 (iniciante) a 10 (avançado)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferência de Lado
            </label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="sidePreference"
                  value="left"
                  checked={formData.sidePreference === "left"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sidePreference: e.target.value as "left" | "right",
                    })
                  }
                  className="text-blue-600"
                />
                <span>Esquerda</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="sidePreference"
                  value="right"
                  checked={formData.sidePreference === "right"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sidePreference: e.target.value as "left" | "right",
                    })
                  }
                  className="text-blue-600"
                />
                <span>Direita</span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Salvando..." : "Completar Cadastro"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
