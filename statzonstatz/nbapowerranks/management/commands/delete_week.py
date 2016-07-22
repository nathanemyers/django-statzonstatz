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

        print 'Deleting data for week ' + str(week) + ': ' + str(year) + '...'
        deleted = Ranking.objects.filter(year=year, week=week).delete()
        print 'Deleted ' + str(deleted[0]) + ' rankings.'

