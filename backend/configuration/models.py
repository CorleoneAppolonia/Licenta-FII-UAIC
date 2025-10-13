from __future__ import annotations

from django.db import models


class EncryptionMode(models.TextChoices):
	PLAINTEXT = 'plaintext', 'Plain Text'
	WEAK_XOR = 'weak_xor', 'Weak XOR Cipher'


class EncryptionSetting(models.Model):
	mode = models.CharField(max_length=64, choices=EncryptionMode.choices, default=EncryptionMode.PLAINTEXT)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Encryption Setting'

	def __str__(self) -> str:  # pragma: no cover - debug display
		return f'Encryption Setting ({self.mode})'

	@classmethod
	def get_solo(cls) -> 'EncryptionSetting':
		obj, _ = cls.objects.get_or_create(id=1, defaults={'mode': EncryptionMode.PLAINTEXT})
		return obj
