export interface AuthState {
  user: { id: string; name: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
