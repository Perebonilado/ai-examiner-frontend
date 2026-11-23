export interface LoginDto {
  status: number;
  data: {
    token: string;
  };
  message: string;
}

export interface SignUpDto {
  status: number;
  data: {
    /** Only for accounts that don't need confirming (guests). */
    token?: string;
    /** Email sign-ups: the account opens once the address is confirmed. */
    needsConfirmation?: boolean;
    email?: string;
  };
  message: string;
}

export interface ConfirmEmailDto {
  status: number;
  message: string;
  data: { token?: string; alreadyConfirmed?: boolean };
}

export interface ForgotPasswordDto {
  message: string;
  status: number;
}

export interface ResetPasswordDto {
  data: { data: null },
  message: string,
  status: number,
}
