from django.contrib.auth.models import User, Group
from .models import UserPiece
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
        fields = ['title', 'midi_file', 'user']