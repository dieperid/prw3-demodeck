export interface AuthState {
  user: { id: string; name: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
