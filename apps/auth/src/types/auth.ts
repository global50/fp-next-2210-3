// Auth state and response types for Telegram authentication
export interface AuthState {
  success: boolean;
  state: string;
  redirect_url: string;
  error?: string;
}

export interface AuthStatusResponse {
  success: boolean;
  completed: boolean;
  magic_link?: string;
  user_id?: string;
  message?: string;
  error?: string;
}