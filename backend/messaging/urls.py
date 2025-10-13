from django.urls import path

from .views import MessageThreadView

urlpatterns = [
    path('<str:username>/', MessageThreadView.as_view(), name='message-thread'),
]
