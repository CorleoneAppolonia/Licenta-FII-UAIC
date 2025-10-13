from django.urls import path

from .views import (
    FriendListView,
    FriendRemoveView,
    FriendRequestCreateView,
    FriendRequestListView,
    FriendRequestResponseView,
)

urlpatterns = [
    path('requests/', FriendRequestListView.as_view(), name='friend-request-list'),
    path('requests/send/', FriendRequestCreateView.as_view(), name='friend-request-create'),
    path('requests/<int:request_id>/respond/', FriendRequestResponseView.as_view(), name='friend-request-respond'),
    path('', FriendListView.as_view(), name='friend-list'),
    path('<str:username>/remove/', FriendRemoveView.as_view(), name='friend-remove'),
]
