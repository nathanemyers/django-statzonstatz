#!/usr/bin/python
import json
from nbapowerranks.models import Team
from django.core.management.base import BaseCommand, CommandError

# This is a little utility for seeding the NBA Teams in the database
# Be advised that re-running with Team data already loaded will screw
# everything up. Sounds like a TODO to me.

# example data format:
  #'teams': [
        #{
          #'city': 'Golden State',
          #'name': 'Warriors',
          #'values': [],
          #'color': '#FDB927',
          #'conference': 'Western',
          #'division': 'Pacific'
        #}, ...
    #]


class Command(BaseCommand):
    help = 'Seeds DB with Team data. *Do not run on populated Team DB!*'
    #def add_arguments(self, parser):

    def handle(self, *args, **options):
        with open('nbapowerranks/data/teams.json') as data_file:
            data = json.load(data_file)

        print 'Loading Teams...'
        for team in data['teams']:
            print team['name']
            team = Team(
                    name=team['name'], 
                    region=team['city'], 
                    conference=team['conference'],
                    division=team['division'],
                    color=team['color'],
                    )
            team.save()

        print 'Done!'
