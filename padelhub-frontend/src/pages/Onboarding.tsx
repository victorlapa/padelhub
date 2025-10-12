import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useGoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAuth } from "@/contexts/AuthContext";

export default function Onboarding() {
  const { mutate: authenticateWithGoogle } = useGoogleAuth();
  const { isLoading } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Send the access token to backend for verification
      authenticateWithGoogle(tokenResponse.access_token);
    },
    onError: (error) => {
      console.error("Google login error:", error);
      alert("Failed to login with Google. Please try again.");
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            type: "spring",
            stiffness: 200,
          }}
        >
          <h1 className="mb-2 text-6xl font-bold text-gray-800">🎾</h1>
          <h2 className="mb-4 text-5xl font-bold text-gray-800">Padel Hub</h2>
          <p className="text-lg text-gray-600">
            Encontre jogadores e organize suas partidas de padel
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          <Button
            onClick={() => handleGoogleLogin()}
            disabled={isLoading}
            className="h-12 w-full border border-gray-300 bg-white text-base font-medium text-gray-700 shadow-md transition-all duration-200 hover:bg-gray-50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="mr-2">⏳</span> Autenticando...
              </>
            ) : (
              <>
                <span className="mr-2 text-lg">G</span> Continuar com Google
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500">
            Ao continuar, você concorda com nossos{" "}
            <span className="cursor-pointer underline">Termos de Serviço</span>{" "}
            e{" "}
            <span className="cursor-pointer underline">
              Política de Privacidade
            </span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
