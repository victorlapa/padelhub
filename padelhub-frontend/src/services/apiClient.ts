/**
 * Simple API client wrapper for axios-style usage
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

export const apiClient = {
  async get<T>(path: string): Promise<{ data: T }> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  },

  async post<T>(path: string, body?: any): Promise<{ data: T }> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  },

  async delete<T>(path: string): Promise<{ data: T }> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  },
};
