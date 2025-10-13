const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePictureUrl?: string;
  category?: number;
  city?: string;
  sidePreference?: "left" | "right";
  isUserVerified: boolean;
}

interface GoogleAuthResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface CompleteRegistrationDto {
  phone?: string;
  city?: string;
  category?: number;
  sidePreference?: "left" | "right";
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
        firstName: "Mock",
        lastName: "User",
        profilePictureUrl: "https://lh3.googleusercontent.com/a/default-user",
        isUserVerified: true,
        category: 8,
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

/**
 * Complete user registration with additional details
 * @param userId - The user ID to update
 * @param data - Additional user information
 * @param token - Auth token
 */
export async function completeUserRegistration(
  userId: string,
  data: CompleteRegistrationDto,
  token: string
): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to complete registration");
    }

    return response.json();
  } catch (error) {
    console.error("Error completing registration:", error);
    throw error;
  }
}

/**
 * Fetch all users from the backend
 * @returns Array of users
 */
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
