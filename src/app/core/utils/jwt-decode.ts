export interface JwtPayload {
  sub: string;
  email: string;
  rol: 'organizador' | 'usuario';
  iat: number;
  exp: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}
