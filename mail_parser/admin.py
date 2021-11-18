from django.contrib import admin
from .models import Profile, Trip

# Register your models here.


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'loc_lat', 'loc_lng', 'pass_phrase')

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('name','departs','points','paths')
