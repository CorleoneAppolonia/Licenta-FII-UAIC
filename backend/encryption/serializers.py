from rest_framework import serializers

from .models import EncryptionSetting


class EncryptionSettingSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=[
        EncryptionSetting.EncryptionMode.PLAINTEXT,
        EncryptionSetting.EncryptionMode.WEAK_XOR,
    ])
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance: EncryptionSetting):
        return {
            'mode': instance.current_mode,
            'updated_at': instance.updated_at,
        }
