from __future__ import annotations

from rest_framework import serializers

from .models import EncryptionMode


class EncryptionModeUpdateSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=EncryptionMode.choices)
