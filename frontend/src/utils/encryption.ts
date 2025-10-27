import type { EncryptionMode } from '../types';

const WEAK_XOR_KEY = 'stego-key';
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function xorBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += 1) {
    result[i] = data[i] ^ key[i % key.length];
  }
  return result;
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encryptPlaintext(message: string): string {
  return message;
}

function decryptPlaintext(message: string): string {
  return message;
}

function encryptWeakXor(message: string): string {
  const data = textEncoder.encode(message);
  const key = textEncoder.encode(WEAK_XOR_KEY);
  const xored = xorBytes(data, key);
  return encodeBase64(xored);
}

function decryptWeakXor(ciphertext: string): string {
  const data = decodeBase64(ciphertext);
  const key = textEncoder.encode(WEAK_XOR_KEY);
  const xored = xorBytes(data, key);
  return textDecoder.decode(xored);
}

export function encryptContent(message: string, mode: EncryptionMode): string {
  if (mode === 'WEAK_XOR') {
    return encryptWeakXor(message);
  }
  return encryptPlaintext(message);
}

export function decryptContent(ciphertext: string, mode: EncryptionMode): string {
  if (mode === 'WEAK_XOR') {
    return decryptWeakXor(ciphertext);
  }
  return decryptPlaintext(ciphertext);
}
