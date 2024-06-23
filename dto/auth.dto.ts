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
    token: string;
  };
  message: string;
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
