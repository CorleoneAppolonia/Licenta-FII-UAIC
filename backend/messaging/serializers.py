from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'encryption_type', 'created_at']
        read_only_fields = ['content']


class MessageCreateSerializer(serializers.Serializer):
    content = serializers.CharField()
