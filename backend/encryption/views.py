from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EncryptionSetting
from .serializers import EncryptionSettingSerializer
from .services import set_current_mode


class EncryptionModeView(APIView):
	permission_classes = [permissions.IsAdminUser]

	def get(self, request, *args, **kwargs):
		setting = EncryptionSetting.get_solo()
		serializer = EncryptionSettingSerializer()
		return Response(serializer.to_representation(setting))

	def post(self, request, *args, **kwargs):
		serializer = EncryptionSettingSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		mode = serializer.validated_data['mode']
		current_mode, changed = set_current_mode(mode)
		return Response(
			{
				'mode': current_mode,
				'updated': changed,
			},
			status=status.HTTP_200_OK,
		)


class EncryptionModeStatusView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, *args, **kwargs):
		setting = EncryptionSetting.get_solo()
		serializer = EncryptionSettingSerializer()
		return Response(serializer.to_representation(setting))
