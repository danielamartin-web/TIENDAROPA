import { SignJWT, jwtVerify } from 'jose';
import { getJwtSecretSync } from '../secret.js';

const ISSUER = 'marda';
const AUDIENCE = 'marda-admin';

export interface JwtPayload {
  sub: string;
  username: string;
  role: 'admin';
}

export async function signAdminToken(payload: JwtPayload, expiresInSec = 8 * 60 * 60): Promise<string> {
  const secret = getJwtSecretSync();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSec)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setSubject(payload.sub)
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = getJwtSecretSync();
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.sub !== 'string' || typeof payload.username !== 'string') return null;
    return { sub: payload.sub, username: payload.username, role: 'admin' };
  } catch {
    return null;
  }
}
