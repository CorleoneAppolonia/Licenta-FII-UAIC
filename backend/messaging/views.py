from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from configuration.services import get_active_strategy
from friendships.models import Friendship
from .models import Conversation, Message
from .serializers import MessageCreateSerializer, MessageSerializer

User = get_user_model()


class AuthenticatedAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]


class MessageThreadView(AuthenticatedAPIView):
	def get_target_user(self, username: str):
		try:
			return User.objects.get(username=username)
		except User.DoesNotExist:
			return None

	def ensure_friendship(self, requester, target):
		if requester == target:
			return Response({'detail': 'Cannot exchange messages with yourself.'}, status=status.HTTP_400_BAD_REQUEST)
		if not Friendship.are_friends(requester, target):
			return Response({'detail': 'You are not friends yet.'}, status=status.HTTP_403_FORBIDDEN)
		return None

	def get(self, request, username, *args, **kwargs):
		target = self.get_target_user(username)
		if target is None:
			return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

		error_response = self.ensure_friendship(request.user, target)
		if error_response:
			return error_response

		conversation, _ = Conversation.get_or_create_between(request.user, target)
		messages = conversation.messages.select_related('sender').all()
		return Response(MessageSerializer(messages, many=True).data)

	def post(self, request, username, *args, **kwargs):
		target = self.get_target_user(username)
		if target is None:
			return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

		error_response = self.ensure_friendship(request.user, target)
		if error_response:
			return error_response

		serializer = MessageCreateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		strategy = get_active_strategy()
		incoming_content = serializer.validated_data['content']
		try:
			plaintext = strategy.decrypt(incoming_content)
		except ValueError:
			return Response({'detail': 'Invalid payload for current encryption mode.'}, status=status.HTTP_400_BAD_REQUEST)
		ciphertext = None if strategy.id == 'plaintext' else incoming_content

		conversation, _ = Conversation.get_or_create_between(request.user, target)
		message = Message.objects.create(
			conversation=conversation,
			sender=request.user,
			content=plaintext,
			ciphertext=ciphertext,
			encryption_mode=strategy.id,
		)
		return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
