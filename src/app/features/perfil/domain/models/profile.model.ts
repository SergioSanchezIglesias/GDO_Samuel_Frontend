export interface Profile {
  id: number;
  name: string;
  email: string;
  provider: 'local' | 'google';
  rol: 'organizador' | 'usuario';
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
}
