import CryptoJS from 'crypto-js';

const secretKey = useRuntimeConfig().public.secretKeyCrypt; // Ambil dari runtime config

// Fungsi untuk encode Base64 URL-safe
function toUrlSafeBase64(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Fungsi untuk decode URL-safe Base64
function fromUrlSafeBase64(urlSafeBase64: string): string {
  let base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64;
}

// Fungsi untuk enkripsi
export function encrypt(text: string): string {
  const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
  return toUrlSafeBase64(encrypted);
}

// Fungsi untuk dekripsi
export function decrypt(urlSafeCipherText: string): string | null {
  try {
    const cipherText = fromUrlSafeBase64(urlSafeCipherText);
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}