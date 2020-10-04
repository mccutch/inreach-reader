from django.contrib import admin
from .models import InReachMessage, Profile

# Register your models here.


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'loc_lat', 'loc_lng')

@admin.register(InReachMessage)
class InReachMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'date', 'lat', 'lon', 'message')
