import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { webcrypto } from 'crypto';

const SALT = 'apa-reports-salt-2026';
const PASSWORD = process.env.ENCRYPT_PASSWORD;
if (!PASSWORD) {
  console.error('ERROR: ENCRYPT_PASSWORD env var is required');
  process.exit(1);
}

const enc = new TextEncoder();

async function deriveKey(password) {
  const keyMaterial = await webcrypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(SALT), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
}

async function encryptFile(inputPath, outputPath, key) {
  const plaintext = readFileSync(inputPath, 'utf-8');
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await webcrypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  const b64 = Buffer.from(combined).toString('base64');
  writeFileSync(outputPath, b64, 'utf-8');
  console.log(`  encrypted: ${basename(inputPath)} -> ${basename(outputPath)}`);
}

async function main() {
  const key = await deriveKey(PASSWORD);
  const reportsDir = join(process.cwd(), 'reports');

  console.log('Encrypting report files...');
  const files = readdirSync(reportsDir).filter(f => f.endsWith('.html'));
  for (const file of files) {
    await encryptFile(
      join(reportsDir, file),
      join(reportsDir, file + '.enc'),
      key
    );
  }

  const manifestPath = join(process.cwd(), 'reports.json');
  console.log('Encrypting reports.json...');
  await encryptFile(manifestPath, manifestPath + '.enc', key);

  console.log(`Done. ${files.length} reports + manifest encrypted.`);
}

main();
