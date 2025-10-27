from django.urls import path

from .views import EncryptionModeView

urlpatterns = [
    path('encryption-mode/', EncryptionModeView.as_view(), name='encryption-mode'),
]
