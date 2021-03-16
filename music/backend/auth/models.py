from django.db import models

class UserPiece(models.Model):
    title = models.CharField(max_length=40)
