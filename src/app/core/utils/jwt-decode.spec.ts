import { describe, expect, it } from 'vitest';

import { decodeJwtPayload, type JwtPayload } from './jwt-decode';

// Helpers to build well-formed test JWTs without any library dependency.
// The function under test uses atob() after replacing URL-safe chars, so we
// encode payloads with standard base64 (no padding issues in jsdom).
function makeTestJwt(payload: Record<string, unknown>): string {
  const payloadJson = JSON.stringify(payload);
  // btoa works in jsdom; encode as base64url (replace + → - and / → _)
  const encoded = btoa(payloadJson).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `header.${encoded}.signature`;
}

describe('decodeJwtPayload', () => {
  it('should return correct JwtPayload for a valid JWT with rol usuario', () => {
    const raw = { sub: '1', email: 'test@test.com', rol: 'usuario', iat: 1000, exp: 2000 };
    const token = makeTestJwt(raw);

    const result = decodeJwtPayload(token);

    expect(result).not.toBeNull();
    expect(result?.sub).toBe('1');
    expect(result?.email).toBe('test@test.com');
    expect(result?.rol).toBe('usuario');
    expect(result?.iat).toBe(1000);
    expect(result?.exp).toBe(2000);
  });

  it('should return correct JwtPayload for a valid JWT with rol organizador', () => {
    const raw = { sub: 'abc123', email: 'user@test.com', rol: 'organizador', iat: 100, exp: 999 };
    const token = makeTestJwt(raw);

    const result = decodeJwtPayload(token);

    expect(result).not.toBeNull();
    expect(result?.rol).toBe('organizador');
    expect(result?.sub).toBe('abc123');
    expect(result?.email).toBe('user@test.com');
  });

  it('should return null for an empty string', () => {
    const result = decodeJwtPayload('');

    expect(result).toBeNull();
  });

  it('should return null for a token with only one segment (no dots)', () => {
    const result = decodeJwtPayload('onlyone');

    expect(result).toBeNull();
  });

  it('should return null for a token with two segments', () => {
    const result = decodeJwtPayload('header.payload');

    expect(result).toBeNull();
  });

  it('should return null for a token with four or more segments', () => {
    const result = decodeJwtPayload('a.b.c.d');

    expect(result).toBeNull();
  });

  it('should return null when the payload segment is not valid base64', () => {
    // '!!!' is not valid base64 and will cause atob() to throw
    const result = decodeJwtPayload('header.!!!invalid!!!.signature');

    expect(result).toBeNull();
  });

  it('should return null when the payload decodes to non-JSON', () => {
    // Valid base64 string that decodes to plain text, not JSON
    const nonJson = btoa('this is not json');
    const result = decodeJwtPayload(`header.${nonJson}.signature`);

    expect(result).toBeNull();
  });

  it('should not throw for any malformed input — always returns null or a payload', () => {
    const inputs = ['', 'x', 'a.b', 'a.b.c.d.e', 'header.!!.sig'];
    for (const input of inputs) {
      expect(() => decodeJwtPayload(input)).not.toThrow();
    }
  });

  it('full round-trip: payload fields are preserved exactly', () => {
    const payload = {
      sub: 'user-42',
      email: 'roundtrip@example.com',
      rol: 'organizador' as const,
      iat: 1700000000,
      exp: 1700003600,
    };
    const token = makeTestJwt(payload);

    const result = decodeJwtPayload(token) as JwtPayload;

    expect(result.sub).toBe(payload.sub);
    expect(result.email).toBe(payload.email);
    expect(result.rol).toBe(payload.rol);
    expect(result.iat).toBe(payload.iat);
    expect(result.exp).toBe(payload.exp);
  });
});
