export interface LoginDto {
  status: number;
  data: {
    token: string;
  };
  message: string;
}
