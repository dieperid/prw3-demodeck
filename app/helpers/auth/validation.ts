export type RegisterPayload = Record<"username" | "password" | "name", string>;

export function validateRegistrationData(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  const errors: Record<string, string> = {};

  if (!username || username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }
  if (!name || name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    payload: { username, password, name } as RegisterPayload,
  };
}
