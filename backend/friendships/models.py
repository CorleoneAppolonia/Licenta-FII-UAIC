from django.conf import settings
from django.db import models, transaction
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Friendship(models.Model):
	user = models.ForeignKey(User, related_name='friends', on_delete=models.CASCADE)
	friend = models.ForeignKey(User, related_name='friends_of', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('user', 'friend')

	@staticmethod
	def are_friends(user, other_user) -> bool:
		return Friendship.objects.filter(user=user, friend=other_user).exists()


class FriendRequest(models.Model):
	class Status(models.TextChoices):
		PENDING = 'PENDING', 'Pending'
		ACCEPTED = 'ACCEPTED', 'Accepted'
		DECLINED = 'DECLINED', 'Declined'

	from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
	to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
	created_at = models.DateTimeField(auto_now_add=True)
	responded_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		unique_together = ('from_user', 'to_user')
		ordering = ['-created_at']

	def accept(self):
		if self.status != self.Status.PENDING:
			return
		with transaction.atomic():
			self.status = self.Status.ACCEPTED
			self.responded_at = timezone.now()
			self.save(update_fields=['status', 'responded_at'])
			Friendship.objects.get_or_create(user=self.from_user, friend=self.to_user)
			Friendship.objects.get_or_create(user=self.to_user, friend=self.from_user)

	def decline(self):
		if self.status != self.Status.PENDING:
			return
		self.status = self.Status.DECLINED
		self.responded_at = timezone.now()
		self.save(update_fields=['status', 'responded_at'])
