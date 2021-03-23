from django.contrib import admin
from .models import UserPiece, PlayablePiece

@admin.register(UserPiece)
class UserPieceAdmin(admin.ModelAdmin):
    list_display = ('title', 'midi_file', 'user')

@admin.register(PlayablePiece)
class PlayablePieceAdmin(admin.ModelAdmin):
    list_display = ('title', 'midi_file')
