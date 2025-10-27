from django.urls import path

from .views import EncryptionModeStatusView

urlpatterns = [
    path('mode/', EncryptionModeStatusView.as_view(), name='encryption-mode-status'),
]
