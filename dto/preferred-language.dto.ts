export interface GetUserPreferredLanguageDto {
  language: string;
  preferredLanguageSet: boolean;
}

export interface CreatePreferredLanguageDto {
  data: {
    id: string;
  };
  message: string;
  status: number;
}

export interface UpdatePreferredLanguageDto {
  data: {
    id: string;
  };
  message: string;
  status: number;
}
