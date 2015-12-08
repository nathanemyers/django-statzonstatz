from django.core.management.base import BaseCommand, CommandError
from nbapowerranks.models import Team, Ranking
from bs4 import BeautifulSoup, NavigableString
import urllib2
import json
import re
import sys

import pdb

# TODO add this as an option
YEAR = 2016

def stripTags(html, invalid_tags):
    for tag in html:
        if tag.name in invalid_tags:
            s = ""
            for c in tag.contents:
                if not isinstance(c, NavigableString):
                    c = stripTags(unicode(c), invalid_tags)
                s += unicode(c)

            tag.replaceWith(s)
    return html

def resolve_team(team_html_link):
    if 'los-angeles-lakers' in team_html_link:
        return Team.objects.get(name='Lakers')
    if 'los-angeles-clippers' in team_html_link:
        return Team.objects.get(name='Clippers')
    if 'warriors' in team_html_link:
        return Team.objects.get(name='Warriors')
    if 'cavaliers' in team_html_link:
        return Team.objects.get(name='Cavaliers')
    if 'spurs' in team_html_link:
        return Team.objects.get(name='Spurs')
    if 'thunder' in team_html_link:
        return Team.objects.get(name='Thunder')
    if 'rockets' in team_html_link:
        return Team.objects.get(name='Rockets')
    if 'grizzlies' in team_html_link:
        return Team.objects.get(name='Grizzlies')
    if 'hawks' in team_html_link:
        return Team.objects.get(name='Hawks')
    if 'heat' in team_html_link:
        return Team.objects.get(name='Heat')
    if 'bulls' in team_html_link:
        return Team.objects.get(name='Bulls')
    if 'pelicans' in team_html_link:
        return Team.objects.get(name='Pelicans')
    if 'raptors' in team_html_link:
        return Team.objects.get(name='Raptors')
    if 'celtics' in team_html_link:
        return Team.objects.get(name='Celtics')
    if 'bucks' in team_html_link:
        return Team.objects.get(name='Bucks')
    if 'wizards' in team_html_link:
        return Team.objects.get(name='Wizards')
    if 'pacers' in team_html_link:
        return Team.objects.get(name='Pacers')
    if 'pistons' in team_html_link:
        return Team.objects.get(name='Pistons')
    if 'jazz' in team_html_link:
        return Team.objects.get(name='Jazz')
    if 'kings' in team_html_link:
        return Team.objects.get(name='Kings')
    if 'suns' in team_html_link:
        return Team.objects.get(name='Suns')
    if 'mavericks' in team_html_link:
        return Team.objects.get(name='Mavericks')
    if 'hornets' in team_html_link:
        return Team.objects.get(name='Hornets')
    if 'magic' in team_html_link:
        return Team.objects.get(name='Magic')
    if 'knicks' in team_html_link:
        return Team.objects.get(name='Knicks')
    if 'wolves' in team_html_link:
        return Team.objects.get(name='Timberwolves')
    if 'nuggets' in team_html_link:
        return Team.objects.get(name='Nuggets')
    if 'blazers' in team_html_link:
        return Team.objects.get(name='Trail Blazers')
    if 'nets' in team_html_link:
        return Team.objects.get(name='Nets')
    if '76ers' in team_html_link:
        return Team.objects.get(name='76ers')

class Command(BaseCommand):
    help = 'Fetches the weekly ranking data from ESPN. If no week is specified, fetch rankings from the current week'

    def add_arguments(self, parser):
        parser.add_argument('--week',
                action='store',
                type=int,
                dest='week',
                nargs='?',
                help='Fetch the specified week')

        parser.add_argument('--test',
                action='store_true',
                dest='test',
                default=False,
                help='Output data to stdout instead of DB')

    def handle(self, *args, **options):
        url = 'http://espn.go.com/nba/powerrankings'
        if 'week' in options and options['week'] is not None:
            url = 'http://espn.go.com/nba/powerrankings/_/week/' + str(options['week'])

        sys.stdout.write('Scraping URL: ' + url + '\n')
        sys.stdout.flush()
        response = urllib2.urlopen(url)
        html = response.read()
        soup = BeautifulSoup(html, 'html.parser')

        table = soup.find('table')

        # Figure out what week we're looking at
        table_head = table.find('tr', 'stathead').find('td').getText()
        m = re.search('Rankings: (Preseason|Week \w+)', table_head)
        matched_week = m.group(1)
        if matched_week == 'Preseason':
            week = 0
        else:
            week = int(re.search('Week (\w+)', matched_week).group(1))

        if not options['test']:
            lookup = Ranking.objects.filter(year=YEAR, week=week)
            if len(lookup) > 0: 
                # TODO should check to see if all 30 rankings are present, 
                # and clean up any partial uploads if needed
                sys.stdout.write('Ranking data for Year: ' + str(YEAR) + ' Week: ' + str(week) + ' already present. Quiting.\n')
                sys.stdout.flush()
                return

        rows = table.find_all('tr', ['evenrow', 'oddrow'])

        if options['test']:
            print 'Year: ' + str(YEAR)
            print 'Week: ' + str(week) + '\n'

        for row in rows:
            cols = row.find_all('td')

            # Here comes all the messy soup
            rank = cols[0].string

            city_col = cols[1].find_all('a')
            # this is the link to the team's detail page, 
            # we can use this to differentiate between the Clippers and the Lakers
            team_html_link = city_col[0].get('href') 

            team = resolve_team(team_html_link)

            comment = stripTags(cols[3], ['b', 'i', 'a', 'u'])
            # TODO comment.getText() will sometimes leave a bunch of whitespace at the end, doesn't seem to effect webapp though
            comment_string = comment.getText()

            record = row.find('span', class_='pr-record').string

            if options['test']:
                print 'Team: ' + str(team)
                print 'Rank: ' + rank
                print 'Record: ' + record
                print 'Summary: ' + comment_string + '\n'
            else:
                rank_object = Ranking(
                        year = YEAR,
                        rank = rank,
                        record = record,
                        team = team,
                        summary = comment_string,
                        week = week
                        )
                rank_object.save()

        sys.stdout.write('Finished scrape of Year: ' + str(YEAR) + ' Week: ' + str(week) + '.\n')
            
