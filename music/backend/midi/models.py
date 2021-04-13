from django.db import models
from django.dispatch import receiver
from jsonfield import JSONField
import os

class UserPiece(models.Model):
    title = models.CharField(max_length=40)
    notes = JSONField(default=list,null=True,blank=True)

class PlayablePiece(models.Model):
    title = models.CharField(max_length=40)
    midi_file = models.FileField(upload_to='playable_midis/')
    time_signature = models.IntegerField(blank=True,null=True)
    time_per_note = models.FloatField(blank=True,null=True)
    grading = JSONField(default=list,null=True,blank=True)
    notes = JSONField(default=list,null=True,blank=True)
