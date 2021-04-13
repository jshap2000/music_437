from django.contrib.auth.models import User, Group
from .models import UserPiece, PlayablePiece
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']

class UserPieceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UserPiece
        fields = ['title', 'notes']

class PlayablePieceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = PlayablePiece
        fields = ['title', 'midi_file', 'time_signature', 'time_per_note', 'grading', 'notes']

