from __future__ import annotations

from .base import EncryptionStrategy

_WEAK_KEY = 'weak-demo-key'


def _xor_cipher(text: str) -> list[int]:
    return [ord(ch) for ch in text]


def _xor_bytes(data: list[int], key: str) -> list[int]:
    key_bytes = [ord(c) for c in key]
    return [value ^ key_bytes[index % len(key_bytes)] for index, value in enumerate(data)]


def _to_hex(values: list[int]) -> str:
    return ''.join(f'{value:02x}' for value in values)


def _from_hex(encoded: str) -> list[int]:
    return [int(encoded[index:index + 2], 16) for index in range(0, len(encoded), 2)]


class PlaintextStrategy(EncryptionStrategy):
    id = 'plaintext'
    label = 'Plain Text'

    def encrypt(self, plaintext: str) -> str:
        return plaintext

    def decrypt(self, ciphertext: str) -> str:
        return ciphertext


class WeakXorStrategy(EncryptionStrategy):
    id = 'weak_xor'
    label = 'Weak XOR Cipher'

    def encrypt(self, plaintext: str) -> str:
        byte_values = _xor_cipher(plaintext)
        cipher_values = _xor_bytes(byte_values, _WEAK_KEY)
        return _to_hex(cipher_values)

    def decrypt(self, ciphertext: str) -> str:
        cipher_values = _from_hex(ciphertext)
        plain_values = _xor_bytes(cipher_values, _WEAK_KEY)
        return ''.join(chr(value) for value in plain_values)
