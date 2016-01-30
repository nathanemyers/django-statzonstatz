from django.db import models

# Create your models here.

class Team(models.Model):
    region = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    color = models.CharField(max_length=50)
    conference = models.CharField(max_length=100)
    division = models.CharField(max_length=100)
    def __str__(self):
        return self.region + ' ' + self.name

class Player(models.Model):
    # TODO split name out into first and last
    name = models.CharField(max_length=200)
    team = models.ForeignKey(Team)
    # TODO extend this with position and stats
    def __str__(self):
        return self.name

class Ranking(models.Model):
    year = models.IntegerField()
    week = models.IntegerField()
    team = models.ForeignKey(Team)
    rank = models.IntegerField()
    record = models.CharField(max_length=20, default='-')
    summary = models.TextField()
    def __str__(self):
        return str(self.year) + ' week ' + str(self.week) + ': ' + str(self.team) + ' #' + str(self.rank)

    class Meta:
        ordering = ['year', 'week', 'rank']

