from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

class Team(models.Model):
    region = db.column(db.String(200), max_length=200)
    name = db.column(db.String(200))
    color = db.column(db.String(50))
    conference = db.column(db.String(100))
    division = db.column(db.String(100))

    def __str__(self):
        return self.region + ' ' + self.name

class Player(models.Model):
    # TODO split name out into first and last
    name = db.column(db.String(200))
    team = db.column(Team)

    team = models.ForeignKey(Team)
    # TODO extend this with position and stats
    def __str__(self):
        return self.name

class Ranking(models.Model):
    year = db.column(db.Integer)
    week = db.column(db.Integer)
    team = db.column(Team)
    rank = db.column(db.Integer)
    record = db.column(db.String(20))
    summary = db.column(db.String(5000))

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

