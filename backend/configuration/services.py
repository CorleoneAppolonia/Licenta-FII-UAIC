from __future__ import annotations

import json
import threading
from dataclasses import asdict
from queue import Queue
from typing import Dict, Iterable

from encryption_modes import EncryptionModeMetadata, get_strategy, list_modes

from .models import EncryptionMode, EncryptionSetting


class _EncryptionNotifier:
    """In-memory publisher for encryption mode changes."""

    def __init__(self) -> None:
        self._subscribers: set[Queue[dict]] = set()
        self._lock = threading.Lock()

    def subscribe(self) -> Queue[dict]:
        queue: Queue[dict] = Queue()
        with self._lock:
            self._subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: Queue[dict]) -> None:
        with self._lock:
            self._subscribers.discard(queue)

    def publish(self, payload: dict) -> None:
        with self._lock:
            for queue in list(self._subscribers):
                queue.put(payload)


encryption_notifier = _EncryptionNotifier()


def _serialize_setting(setting: EncryptionSetting) -> dict:
    strategy = get_strategy(setting.mode)
    return {
        'mode': setting.mode,
        'label': strategy.label,
        'updated_at': setting.updated_at.isoformat(),
        'available_modes': [asdict(meta) for meta in list_modes()],
    }


def get_encryption_status() -> dict:
    setting = EncryptionSetting.get_solo()
    return _serialize_setting(setting)


def get_encryption_mode() -> str:
    return EncryptionSetting.get_solo().mode


def get_active_strategy():
    return get_strategy(get_encryption_mode())


def set_encryption_mode(mode: str) -> dict:
    if mode not in {choice.value for choice in EncryptionMode}:
        raise ValueError(f'Unsupported mode: {mode}')

    setting = EncryptionSetting.get_solo()
    if setting.mode != mode:
        setting.mode = mode
        setting.save(update_fields=['mode', 'updated_at'])
        payload = _serialize_setting(setting)
        encryption_notifier.publish(payload)
        return payload
    return _serialize_setting(setting)


def encryption_event_stream() -> Iterable[bytes]:
    """Generator yielding Server-Sent Events for encryption changes."""

    initial = get_encryption_status()
    yield _format_sse(initial)

    queue = encryption_notifier.subscribe()
    try:
        while True:
            payload = queue.get()
            yield _format_sse(payload)
    finally:
        encryption_notifier.unsubscribe(queue)


def _format_sse(payload: Dict[str, object]) -> bytes:
    data = json.dumps(payload)
    return f'data: {data}\n\n'.encode('utf-8')
