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
    notes = JSONField(default=list,null=True,blank=True)

@receiver(models.signals.post_delete, sender=PlayablePiece)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `MediaFile` object is deleted.
    """
    if instance.midi_file:
        if os.path.isfile(instance.midi_file.path):
            os.remove(instance.midi_file.path)

@receiver(models.signals.pre_save, sender=PlayablePiece)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """
    Deletes old file from filesystem
    when corresponding `MediaFile` object is updated
    with new file.
    """
    if not instance.pk:
        return False

    try:
        old_file = PlayablePiece.objects.get(pk=instance.pk).midi_file
    except PlayablePiece.DoesNotExist:
        return False

    new_file = instance.midi_file
    if not old_file == new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)
