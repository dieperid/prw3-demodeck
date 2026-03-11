import { ENV } from "~/config/env.server";
import type { RegisterPayload } from "~/helper/auth/validation";

export async function registerUserApi(
  payload: RegisterPayload,
): Promise<{ id: string }> {
  const response = await fetch(`${ENV.BACKEND_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Registration failed. Please try again.",
    );
  }

  return response.json();
}
