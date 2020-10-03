# carbontax/urls.py

from django.urls import path, include
from . import views
#from rest_framework_simplejwt import views as jwt_views
#from rest_framework.urlpatterns import format_suffix_patterns
#from django.contrib.auth import views as auth_views
from django.views.generic.base import TemplateView #Serve sw.js
#from . import serializers




urlpatterns = [
    # STATIC ASSETS
    #path('', views.index, name='index'),
    path('', TemplateView.as_view(template_name="index.html"), name='index'),   
    path('api-auth/', include('rest_framework.urls')),
    path('api/inreach-messages/', views.InReachMessages.as_view(), name="inreach-messages"),
]

