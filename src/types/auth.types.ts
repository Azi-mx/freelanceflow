export interface ITokenPayload {
  id: string;
}

export interface IUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
}

export interface IAuthResult {
  accessToken: string;
  refreshToken: string;
  user: IUserResponse;
}
