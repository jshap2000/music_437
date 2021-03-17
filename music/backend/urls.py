from django.urls import include, path
from django.contrib import admin
from django.conf.urls import include, url
from rest_framework import routers
from backend.midi import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'user_pieces', views.UserPieceViewSet)
router.register(r'playable_pieces', views.PlayablePieceViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    url(r'^admin/', admin.site.urls),
    path('api/', include('rest_framework.urls', namespace='rest_framework'))
    
]