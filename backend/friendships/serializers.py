from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import FriendRequest, Friendship

User = get_user_model()


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at', 'responded_at']


class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class FriendRequestCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)

    def validate(self, attrs):
        requester = self.context['request'].user
        try:
            target = User.objects.get(username=attrs['username'])
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({'username': 'User not found.'}) from exc

        if target == requester:
            raise serializers.ValidationError({'username': 'Cannot send a friend request to yourself.'})

        if Friendship.are_friends(requester, target):
            raise serializers.ValidationError({'username': 'You are already friends.'})

        if FriendRequest.objects.filter(
            from_user=requester,
            to_user=target,
            status=FriendRequest.Status.PENDING,
        ).exists():
            raise serializers.ValidationError({'username': 'Friend request already sent.'})

        if FriendRequest.objects.filter(
            from_user=target,
            to_user=requester,
            status=FriendRequest.Status.PENDING,
        ).exists():
            raise serializers.ValidationError({'username': 'User already sent you a request pending response.'})

        attrs['target_user'] = target
        return attrs


class FriendRequestResponseSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['accept', 'decline'])