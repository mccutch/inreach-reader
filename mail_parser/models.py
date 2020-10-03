from django.db import models

# Create your models here.
class InReachMessage(models.Model):
    sender = models.CharField(max_length=30, default="Unknown")
    date = models.DateField(null=True)
    lat = models.FloatField(default=0)
    lon = models.FloatField(default=0)
    
    def __str__(self):
        """String for representing the Model object."""
        return f'{self.sender}, {self.date}'