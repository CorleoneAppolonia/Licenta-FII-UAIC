from django.conf import settings
from django.db import models

from encryption.models import EncryptionSetting

User = settings.AUTH_USER_MODEL


class Conversation(models.Model):
	user_a = models.ForeignKey(User, related_name='conversations_as_primary', on_delete=models.CASCADE)
	user_b = models.ForeignKey(User, related_name='conversations_as_secondary', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('user_a', 'user_b')

	@staticmethod
	def participants_key(user_id: int, other_id: int) -> tuple[int, int]:
		return (user_id, other_id) if user_id < other_id else (other_id, user_id)

	@classmethod
	def get_or_create_between(cls, user, other_user):
		first_id, second_id = cls.participants_key(user.id, other_user.id)
		return cls.objects.get_or_create(user_a_id=first_id, user_b_id=second_id)

	def includes(self, user) -> bool:
		return user.id in {self.user_a_id, self.user_b_id}

	def other_participant(self, user):
		if user.id == self.user_a_id:
			return self.user_b
		if user.id == self.user_b_id:
			return self.user_a
		raise ValueError('User not part of this conversation')


class Message(models.Model):
	conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
	sender = models.ForeignKey(User, related_name='messages_sent', on_delete=models.CASCADE)
	content = models.TextField()
	encryption_type = models.CharField(
		max_length=32,
		choices=EncryptionSetting.EncryptionMode.choices,
		default=EncryptionSetting.EncryptionMode.PLAINTEXT,
	)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['created_at']
