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