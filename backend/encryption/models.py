from django.db import models


class EncryptionSetting(models.Model):
	class EncryptionMode(models.TextChoices):
		PLAINTEXT = 'PLAINTEXT', 'Plaintext'
		WEAK_XOR = 'WEAK_XOR', 'Weak XOR'
		END_TO_END = 'END_TO_END', 'End-to-End Encrypted'
		END_TO_END_STEGO = 'END_TO_END_STEGO', 'End-to-End Encrypted + Steganography'

	current_mode = models.CharField(
		max_length=32,
		choices=EncryptionMode.choices,
		default=EncryptionMode.PLAINTEXT,
	)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Encryption setting'
		verbose_name_plural = 'Encryption settings'

	def __str__(self):
		return f'EncryptionSetting(mode={self.current_mode})'

	@classmethod
	def get_solo(cls):
		setting, _ = cls.objects.get_or_create(id=1)
		return setting
