from django.urls import path

from .views import EncryptionStatusStreamView, EncryptionStatusView

urlpatterns = [
    path('encryption/', EncryptionStatusView.as_view(), name='encryption-status'),
    path('encryption/stream/', EncryptionStatusStreamView.as_view(), name='encryption-status-stream'),
]
