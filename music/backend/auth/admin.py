from django.contrib import admin
from .models import UserPiece

@admin.register(UserPiece)
class PieceAdmin(admin.ModelAdmin):
    list_display = ('title')
