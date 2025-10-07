import { useMutation } from "@tanstack/react-query";
import { authenticateWithGoogle } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router";

export function useGoogleAuth() {
  const { login, setIsLoading } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authenticateWithGoogle,
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      // Store the auth token
      localStorage.setItem("authToken", data.token);

      // Update auth context with user data
      login(data.user);

      // Navigate to the app
      navigate("/app");
    },
    onError: (error: Error) => {
      console.error("Authentication error:", error);
      // You can add toast notification here
      alert(error.message || "Failed to authenticate with Google");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  return mutation;
}