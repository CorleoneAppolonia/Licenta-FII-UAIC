from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'ciphertext', 'encryption_mode', 'created_at']


class MessageCreateSerializer(serializers.Serializer):
    content = serializers.CharField()
