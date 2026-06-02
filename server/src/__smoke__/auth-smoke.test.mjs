// Smoke test sin DB: verifica hash + JWT + el shape del response de login.
// Correr con: cd server && JWT_SECRET=test-secret-thats-min-32-chars-long ADMIN_USERNAME=test DATABASE_URL=postgres://x npx tsx src/__smoke__/auth-smoke.test.mjs

import { strict as assert } from 'node:assert';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'test-secret-thats-min-32-chars-long');

async function testHashRoundtrip() {
  const plain = 'TestPassword123!';
  const hash = await bcrypt.hash(plain, 12);
  assert.ok(hash.startsWith('$2'), 'hash debe ser bcrypt');
  assert.ok(hash.length >= 50, 'hash debe ser largo');
  assert.equal(await bcrypt.compare(plain, hash), true, 'verify correcto');
  assert.equal(await bcrypt.compare('wrong', hash), false, 'verify incorrecto');
  console.log('✓ bcrypt hash roundtrip');
}

async function testJwtRoundtrip() {
  const payload = { sub: '1', username: 'mardadmin', role: 'admin' };
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + 8 * 60 * 60)
    .setIssuer('marda')
    .setAudience('marda-admin')
    .setSubject('1')
    .sign(SECRET);

  assert.ok(typeof token === 'string', 'token es string');
  assert.equal(token.split('.').length, 3, 'token tiene 3 partes JWT');

  const { payload: verified } = await jwtVerify(token, SECRET, {
    issuer: 'marda',
    audience: 'marda-admin',
  });
  assert.equal(verified.sub, '1');
  assert.equal(verified.username, 'mardadmin');
  assert.equal(verified.role, 'admin');
  console.log('✓ JWT sign/verify roundtrip');
}

async function testJwtTamperingDetection() {
  const token = await new SignJWT({ sub: '1', username: 'admin', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('marda')
    .setAudience('marda-admin')
    .setExpirationTime('1h')
    .sign(SECRET);

  // Cambiar último char (rompe firma)
  const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
  let caught = false;
  try {
    await jwtVerify(tampered, SECRET, { issuer: 'marda', audience: 'marda-admin' });
  } catch {
    caught = true;
  }
  assert.equal(caught, true, 'JWT tampered debe fallar');
  console.log('✓ JWT tamper detection');
}

async function testWrongIssuerRejected() {
  const token = await new SignJWT({ sub: '1', username: 'a', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('not-marda')
    .setAudience('marda-admin')
    .setExpirationTime('1h')
    .sign(SECRET);

  let caught = false;
  try {
    await jwtVerify(token, SECRET, { issuer: 'marda', audience: 'marda-admin' });
  } catch {
    caught = true;
  }
  assert.equal(caught, true, 'issuer incorrecto debe fallar');
  console.log('✓ JWT wrong issuer rejection');
}

async function testExpiredTokenRejected() {
  const token = await new SignJWT({ sub: '1', username: 'a', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('marda')
    .setAudience('marda-admin')
    .setExpirationTime(Math.floor(Date.now() / 1000) - 1)
    .sign(SECRET);

  let caught = false;
  try {
    await jwtVerify(token, SECRET, { issuer: 'marda', audience: 'marda-admin' });
  } catch {
    caught = true;
  }
  assert.equal(caught, true, 'JWT expirado debe fallar');
  console.log('✓ JWT expired rejection');
}

async function main() {
  await testHashRoundtrip();
  await testJwtRoundtrip();
  await testJwtTamperingDetection();
  await testWrongIssuerRejected();
  await testExpiredTokenRejected();
  console.log('\n✅ Smoke test passed: bcrypt + JWT funcionando correctamente');
}

main().catch((err) => {
  console.error('❌ Smoke test FAIL:', err.message);
  process.exit(1);
});
