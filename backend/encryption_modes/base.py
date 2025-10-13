from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


class EncryptionStrategy(Protocol):
    """Protocol for pluggable encryption strategies."""

    id: str
    label: str

    def encrypt(self, plaintext: str) -> str:
        ...

    def decrypt(self, ciphertext: str) -> str:
        ...


@dataclass(frozen=True)
class EncryptionModeMetadata:
    id: str
    label: str
    description: str | None = None
