from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, primary_key=True, on_delete=models.CASCADE)
    FirstName = models.CharField(max_length=50, null=False, blank=True, default='')
    SecondName = models.CharField(max_length=50, null=False, blank=True, default='')
    MiddleName = models.CharField(max_length=50, null=True, blank=True)
    Email = models.CharField(max_length=50, null=False, blank=True, default='')
    City = models.CharField(max_length=50, null=True, blank=True)
    Club = models.CharField(max_length=50, null=True, blank=True)
    Rating = models.IntegerField(null=True, blank=True)
    Rank = models.CharField(max_length=50, null=True, blank=True)
    BirthDate = models.DateField(null=True, blank=True)
    LastGame = models.DateField(null=True, blank=True)
    Confirmed = models.BooleanField(null=False, default=False)
    OfficialRole = models.IntegerField(null=False, default=0)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
