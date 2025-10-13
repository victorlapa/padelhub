import { motion } from "motion/react";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function Onboarding() {
  const { mutate: authenticateWithGoogle } = useGoogleAuth();

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
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  authenticateWithGoogle(credentialResponse.credential);
                }
              }}
              onError={() => {
                console.error("Google login failed");
                alert("Failed to login with Google. Please try again.");
              }}
              useOneTap
              text="continue_with"
              size="large"
              width="384"
            />
          </div>

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
