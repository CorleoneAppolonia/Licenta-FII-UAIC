import base64
from dataclasses import dataclass
from typing import Tuple

from .models import EncryptionSetting

WEAK_XOR_KEY = b"stego-key"


@dataclass(frozen=True)
class EncryptionResult:
    ciphertext: str
    mode: str


def get_current_mode() -> str:
    return EncryptionSetting.get_solo().current_mode


def set_current_mode(mode: str) -> Tuple[str, bool]:
    setting = EncryptionSetting.get_solo()
    changed = setting.current_mode != mode
    if changed:
        setting.current_mode = mode
        setting.save(update_fields=['current_mode', 'updated_at'])
    return setting.current_mode, changed


def _xor_bytes(data: bytes, key: bytes) -> bytes:
    key_length = len(key)
    return bytes(b ^ key[i % key_length] for i, b in enumerate(data))


def encrypt_plaintext(message: str) -> str:
    return message


def decrypt_plaintext(message: str) -> str:
    return message


def encrypt_weak_xor(message: str) -> str:
    raw = message.encode('utf-8')
    xored = _xor_bytes(raw, WEAK_XOR_KEY)
    return base64.b64encode(xored).decode('ascii')


def decrypt_weak_xor(ciphertext: str) -> str:
    data = base64.b64decode(ciphertext.encode('ascii'))
    plain_bytes = _xor_bytes(data, WEAK_XOR_KEY)
    return plain_bytes.decode('utf-8')


def encrypt_message(message: str) -> EncryptionResult:
    mode = get_current_mode()
    if mode == EncryptionSetting.EncryptionMode.WEAK_XOR:
        return EncryptionResult(ciphertext=encrypt_weak_xor(message), mode=mode)
    # Future modes fall back to plaintext until implemented
    return EncryptionResult(ciphertext=encrypt_plaintext(message), mode=EncryptionSetting.EncryptionMode.PLAINTEXT)


def decrypt_message(ciphertext: str, mode: str) -> str:
    if mode == EncryptionSetting.EncryptionMode.WEAK_XOR:
        return decrypt_weak_xor(ciphertext)
    return decrypt_plaintext(ciphertext)
