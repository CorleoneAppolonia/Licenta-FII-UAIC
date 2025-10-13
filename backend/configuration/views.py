from __future__ import annotations

from django.http import StreamingHttpResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import EncryptionModeUpdateSerializer
from .services import encryption_event_stream, get_encryption_status, set_encryption_mode


class EncryptionStatusView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, *args, **kwargs):
		return Response(get_encryption_status())

	def put(self, request, *args, **kwargs):
		if not request.user.is_staff:
			return Response({'detail': 'Admin privileges required.'}, status=status.HTTP_403_FORBIDDEN)
		serializer = EncryptionModeUpdateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		status_payload = set_encryption_mode(serializer.validated_data['mode'])
		return Response(status_payload)


class EncryptionStatusStreamView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, *args, **kwargs):
		response = StreamingHttpResponse(encryption_event_stream(), content_type='text/event-stream')
		response['Cache-Control'] = 'no-cache'
		return response
