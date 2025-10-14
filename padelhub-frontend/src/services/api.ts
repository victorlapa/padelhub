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

export interface Club {
  id: string;
  name: string;
  address: string;
  pictureUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  appUrl?: string;
  pixKey?: string;
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  userId: string;
  user: User;
  team: "UNASSIGNED" | "A" | "B";
  joinedAt: string;
}

export type MatchStatus = "COMPLETED" | "CANCELLED" | "IN_PROGRESS" | "PENDING";

export interface Match {
  matchId: string;
  clubId: string;
  club: Club;
  courtId?: string;
  startDate: string;
  endDate: string;
  category: number;
  status: MatchStatus;
  password?: string;
  isCourtScheduled: boolean;
  matchPlayers: MatchPlayer[];
  createdAt: string;
  updatedAt: string;
}

interface GoogleAuthResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface CompleteRegistrationDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  category?: number;
  sidePreference?: "left" | "right";
}

export interface CreateClubDto {
  name: string;
  address: string;
  pictureUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  appUrl?: string;
  pixKey?: string;
}

export interface CreateMatchDto {
  clubId: string;
  courtId?: string;
  startDate: string;
  endDate: string;
  category: number;
  status?: MatchStatus;
  password?: string;
  isCourtScheduled?: boolean;
}

export interface AddPlayerDto {
  userId: string;
  team?: "UNASSIGNED" | "A" | "B";
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

/**
 * Fetch all matches from the backend
 * @returns Array of matches
 */
export async function getMatches(): Promise<Match[]> {
  try {
    const response = await fetch(`${API_URL}/matches`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch matches");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
}

/**
 * Fetch all clubs from the backend
 * @returns Array of clubs
 */
export async function getClubs(): Promise<Club[]> {
  try {
    const response = await fetch(`${API_URL}/clubs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch clubs");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching clubs:", error);
    throw error;
  }
}

/**
 * Create a new club
 * @param data - Club information
 * @returns Created club
 */
export async function createClub(data: CreateClubDto): Promise<Club> {
  try {
    const response = await fetch(`${API_URL}/clubs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create club");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating club:", error);
    throw error;
  }
}

/**
 * Create a new match
 * @param data - Match information
 * @returns Created match
 */
export async function createMatch(data: CreateMatchDto): Promise<Match> {
  try {
    const response = await fetch(`${API_URL}/matches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create match");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating match:", error);
    throw error;
  }
}

/**
 * Fetch a single match by ID
 * @param matchId - The match ID
 * @returns Match details
 */
export async function getMatchById(matchId: string): Promise<Match> {
  try {
    const response = await fetch(`${API_URL}/matches/${matchId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch match");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching match:", error);
    throw error;
  }
}

/**
 * Add current user to a match
 * @param matchId - The match ID to join
 * @param userId - The user ID
 * @param team - Optional team assignment
 * @returns Updated match player record
 */
export async function joinMatch(
  matchId: string,
  userId: string,
  team: "UNASSIGNED" | "A" | "B" = "UNASSIGNED"
): Promise<MatchPlayer> {
  try {
    const response = await fetch(`${API_URL}/matches/${matchId}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, team }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to join match");
    }

    return response.json();
  } catch (error) {
    console.error("Error joining match:", error);
    throw error;
  }
}

/**
 * Remove a player from a match
 * @param matchId - The match ID to leave
 * @param userId - The user ID to remove
 * @returns Success response
 */
export async function leaveMatch(
  matchId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${API_URL}/matches/${matchId}/players/${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to leave match");
    }

    return response.json();
  } catch (error) {
    console.error("Error leaving match:", error);
    throw error;
  }
}
