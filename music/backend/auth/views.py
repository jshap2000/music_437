from django.contrib.auth.models import User, Group
from .models import UserPiece
from rest_framework import viewsets
from rest_framework import permissions
from backend.auth.serializers import UserSerializer, GroupSerializer, UserPieceSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserPieceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = UserPiece.objects.all()
    serializer_class = UserPieceSerializer
    permission_classes = [permissions.IsAuthenticated]