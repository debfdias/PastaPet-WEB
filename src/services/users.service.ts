import { httpClient } from "@/lib/httpClient";

/**
 * User data from API
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Update user profile data
 */
export interface UpdateUserData {
  fullName?: string;
  password?: string;
}

/**
 * Update user profile
 * @param token - Authentication token
 * @param userId - User ID to update
 * @param data - User data to update
 */
export async function updateUser(
  token: string,
  userId: string,
  data: UpdateUserData
): Promise<User> {
  return httpClient.put<User>(token, `/users/${userId}`, data);
}

/**
 * Get current user by ID
 * @param token - Authentication token
 * @param userId - User ID
 */
export async function getUserById(
  token: string,
  userId: string
): Promise<User | null> {
  try {
    return await httpClient.get<User>(token, `/users/${userId}`, {
      next: {
        revalidate: 3600, // Revalidate every hour
        tags: ["users", `user-${userId}`],
      },
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}






