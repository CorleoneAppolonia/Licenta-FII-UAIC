from __future__ import annotations

from typing import Dict

from .base import EncryptionModeMetadata, EncryptionStrategy
from .strategies import PlaintextStrategy, WeakXorStrategy

_STRATEGIES: Dict[str, EncryptionStrategy] = {
    PlaintextStrategy.id: PlaintextStrategy(),
    WeakXorStrategy.id: WeakXorStrategy(),
}

_METADATA = [
    EncryptionModeMetadata(id=strategy.id, label=strategy.label)
    for strategy in _STRATEGIES.values()
]


def get_strategy(mode: str) -> EncryptionStrategy:
    try:
        return _STRATEGIES[mode]
    except KeyError as exc:
        raise ValueError(f'Unknown encryption mode: {mode}') from exc


def list_modes() -> list[EncryptionModeMetadata]:
    return list(_METADATA)
