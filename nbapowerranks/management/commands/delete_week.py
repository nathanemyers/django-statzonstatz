from django.core.management.base import BaseCommand, CommandError
from nbapowerranks.models import Team, Ranking
import json
import re
import sys

class Command(BaseCommand):
    help = 'Delete a week\'s data from the DB.'

    def add_arguments(self, parser):
        parser.add_argument('--week',
                action='store',
                type=int,
                dest='week',
                nargs='?',
                help='Delete the specified week')

    def add_arguments(self, parser):
        parser.add_argument('--year',
                action='store',
                type=int,
                dest='year',
                nargs='?',
                default=2016,
                help='Delete the specified year')

    def handle(self, *args, **options):
        week = options['week']
        year = options['year']

        print 'Deleting data for week ' + str(week) + ': ' + str(year)


                #rank_object = Ranking(
                        #year = YEAR,
                        #rank = rank,
                        #record = record,
                        #team = team,
                        #summary = comment_string,
                        #week = week
                        #)
                #rank_object.save()

            
