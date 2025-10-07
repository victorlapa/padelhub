const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface GoogleAuthResponse {
  success: boolean;
  user: User;
  token: string;
}

/**
 * Mock backend response for development
 */
function mockGoogleAuthResponse(_credential: string): Promise<GoogleAuthResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate backend processing
      const mockUser: User = {
        id: "mock-user-123",
        email: "user@example.com",
        name: "Mock User",
        picture: "https://lh3.googleusercontent.com/a/default-user",
      };

      const mockToken = `mock-jwt-token-${Date.now()}`;

      resolve({
        success: true,
        user: mockUser,
        token: mockToken,
      });
    }, 1000); // Simulate network delay
  });
}

/**
 * Send Google OAuth credential to backend for verification
 * @param credential - The credential JWT token from Google
 * @returns User data and auth token from backend
 */
export async function authenticateWithGoogle(
  credential: string
): Promise<GoogleAuthResponse> {
  // Use mock response if backend is not available
  if (USE_MOCK) {
    console.log("🔧 Using mock API response");
    return mockGoogleAuthResponse(credential);
  }

  try {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Authentication failed");
    }

    return response.json();
  } catch (error) {
    // Fallback to mock if backend is unavailable
    console.warn("⚠️ Backend unavailable, falling back to mock response", error);
    return mockGoogleAuthResponse(credential);
  }
}

/**
 * Verify the current user's token
 * @param token - The auth token to verify
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
