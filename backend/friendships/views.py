from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FriendRequest, Friendship
from .serializers import (
	FriendRequestCreateSerializer,
	FriendRequestResponseSerializer,
	FriendRequestSerializer,
	FriendSerializer,
)

User = get_user_model()


class AuthenticatedAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]


class FriendRequestCreateView(AuthenticatedAPIView):
	def post(self, request, *args, **kwargs):
		serializer = FriendRequestCreateSerializer(data=request.data, context={'request': request})
		serializer.is_valid(raise_exception=True)

		target_user = serializer.validated_data['target_user']
		friend_request = FriendRequest.objects.create(from_user=request.user, to_user=target_user)
		return Response(FriendRequestSerializer(friend_request).data, status=status.HTTP_201_CREATED)


class FriendRequestListView(AuthenticatedAPIView):
	def get(self, request, *args, **kwargs):
		incoming = FriendRequest.objects.filter(to_user=request.user, status=FriendRequest.Status.PENDING)
		outgoing = FriendRequest.objects.filter(from_user=request.user, status=FriendRequest.Status.PENDING)
		return Response(
			{
				'incoming': FriendRequestSerializer(incoming, many=True).data,
				'outgoing': FriendRequestSerializer(outgoing, many=True).data,
			}
		)


class FriendRequestResponseView(AuthenticatedAPIView):
	def post(self, request, request_id, *args, **kwargs):
		serializer = FriendRequestResponseSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		action = serializer.validated_data['action']

		try:
			friend_request = FriendRequest.objects.get(id=request_id, to_user=request.user)
		except FriendRequest.DoesNotExist:
			return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

		if friend_request.status != FriendRequest.Status.PENDING:
			return Response({'detail': f'Request already {friend_request.status.lower()}.'}, status=status.HTTP_400_BAD_REQUEST)

		if action == 'accept':
			friend_request.accept()
		else:
			friend_request.decline()

		return Response(FriendRequestSerializer(friend_request).data)


class FriendListView(AuthenticatedAPIView):
	def get(self, request, *args, **kwargs):
		friendships = Friendship.objects.filter(user=request.user).select_related('friend')
		friends = [relation.friend for relation in friendships]
		return Response(FriendSerializer(friends, many=True).data)


class FriendRemoveView(AuthenticatedAPIView):
	def delete(self, request, username, *args, **kwargs):
		try:
			friend = User.objects.get(username=username)
		except User.DoesNotExist:
			return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

		Friendship.objects.filter(user=request.user, friend=friend).delete()
		Friendship.objects.filter(user=friend, friend=request.user).delete()
		FriendRequest.objects.filter(from_user=request.user, to_user=friend).delete()
		FriendRequest.objects.filter(from_user=friend, to_user=request.user).delete()
		return Response(status=status.HTTP_204_NO_CONTENT)
