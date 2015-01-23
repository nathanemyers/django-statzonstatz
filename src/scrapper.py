#!/usr/bin/python

from bs4 import BeautifulSoup
import urllib2
import json

teamdata =  {
        'dates': [],
        'teams': [
            {
                'city': 'Golden State',
                'name': 'Warriors',
                'values': [],
                'color': '#FDB927',
                'conference': 'Western',
                'division': 'Pacific'
                },
            {
                'city': 'Chicago',
                'name': 'Bulls',
                'values': [],
                'color': '#CE1141',
                'conference': 'Eastern',
                'division': 'Central'
                },
            {
                'city': 'Toronto',
                'name': 'Raptors',
                'values': [],
                'color': '#CE1141',
                'conference': 'Eastern',
                'division': 'Atlantic'
                },
            {
                'city': 'Cleveland',
                'name': 'Cavs',
                'values': [],
                'color': '#860038',
                'conference': 'Eastern',
                'division': 'Central'
                },
            {
                'city': 'Washington',
                'name': 'Wizards',
                'values': [],
                'color': '#002566',
                'conference': 'Eastern',
                'division': 'Southeast'
                },
            {
                'city': 'Miami',
                'name': 'Heat',
                'values': [],
                'color': '#98002E',
                'conference': 'Eastern',
                'division': 'Southeast'
                },
            {
                'city': 'Milwaukee',
                'name': 'Bucks',
                'values': [],
                'color': '#00471B',
                'conference': 'Eastern',
                'division': 'Central'
                },
            {
                    'city': 'Atlanta',
                    'name': 'Hawks',
                    'values': [],
                    'color': '#E13A3E',
                    'conference': 'Eastern',
                    'division': 'Southeast'
                    },
            {
                    'city': 'Oklahoma City',
                    'name': 'Thunder',
                    'values': [],
                    'color': '#007DC6',
                    'conference': 'Western',
                    'division': 'Northwest'
                    },
            {
                    'city': 'Sacramento',
                    'name': 'Kings',
                    'values': [],
                    'color': '#724C9F',
                    'conference': 'Western',
                    'division': 'Pacific'
                    },
            {
                    'city': 'Houston',
                    'name': 'Rockets',
                    'values': [],
                    'color': '#CE1141',
                    'conference': 'Western',
                    'division': 'Southwest'
                    },
            {
                    'city': 'Los Angeles',
                    'values': [],
                    'team': 'Clippers',
                    'color': '#006BB6',
                    'conference': 'Western',
                    'division': 'Pacific'
                    },
            {
                    'city': 'Los Angeles',
                    'values': [],
                    'team': 'Lakers',
                    'color': '#552582',
                    'conference': 'Western',
                    'division': 'Pacific'
                    },
            {
                    'city': 'Portland',
                    'name': 'Trail Blazers',
                    'values': [],
                    'color': '#B6BFBF',
                    'conference': 'Western',
                    'division': 'Northwest'
                    },
            {
                    'city': 'Dallas',
                    'name': 'Mavericks',
                    'values': [],
                    'color': '#007DC5',
                    'conference': 'Western',
                    'division': 'Southwest'
                    },
            {
                    'city': 'San Antonio',
                    'name': 'Spurs',
                    'values': [],
                    'color': '#000000',
                    'conference': 'Western',
                    'division': 'Southwest'
                    },
            {
                    'city': 'Memphis',
                    'name': 'Grizzlies',
                    'values': [],
                    'color': '#002566',
                    'conference': 'Western',
                    'division': 'Southwest'
                    },
            {
                    'city': 'Denver',
                    'name': 'Nuggets',
                    'values': [],
                    'color': '#FFB20F',
                    'conference': 'Western',
                    'division': 'Northwest'
                    },
            {
                    'city': 'Indiana',
                    'name': 'Pacers',
                    'values': [],
                    'color': '#00275D',
                    'conference': 'Eastern',
                    'division': 'Central'
                    },
            {
                    'city': 'Phoenix',
                    'name': 'Suns',
                    'values': [],
                    'color': '#E56020',
                    'conference': 'Western',
                    'division': 'Pacific'
                    },
            {
                    'city': 'New Orleans',
                    'name': 'Pelicans',
                    'values': [],
                    'color': '#001641',
                    'conference': 'Eastern',
                    'division': 'Southwest'
                    },
            {
                    'city': 'Orlando',
                    'name': 'Magic',
                    'values': [],
                    'color': '#007DC5',
                    'conference': 'Eastern',
                    'division': 'Southeast'
                    },
            {
                    'city': 'Brooklyn',
                    'name': 'Nets',
                    'values': [],
                    'color': '#000000',
                    'conference': 'Eastern',
                    'division': 'Atlantic'
                    },
            {
                    'city': 'Boston',
                    'name': 'Celtics',
                    'values': [],
                    'color': '#008348',
                    'conference': 'Eastern',
                    'division': 'Atlantic'
                    },
            {
                    'city': 'Utah',
                    'name': 'Jazz',
                    'values': [],
                    'color': '#002B5C',
                    'conference': 'Western',
                    'division': 'Northwest'
                    },
            {
                    'city': 'Minnesota',
                    'name': 'Timberwolves',
                    'values': [],
                    'color': '#00A94F',
                    'conference': 'Western',
                    'division': 'Northwest'
                    },
            {
                    'city': 'New York',
                    'name': 'Knicks',
                    'values': [],
                    'color': '#F58426',
                    'conference': 'Eastern',
                    'division': 'Atlantic'
                    },
            {
                    'city': 'Philadelphia',
                    'name': '76ers',
                    'values': [],
                    'color': '#ED174C',
                    'conference': 'Eastern',
                    'division': 'Atlantic'
                    },
            {
                    'city': 'Detroit',
                    'name': 'Pistons',
                    'values': [],
                    'color': '#ED174C',
                    'conference': 'Eastern',
                    'division': 'Central'
                    },
            {
                    'city': 'Charlotte',
                    'name': 'Hornets',
                    'values': [],
                    'color': '#1D1160',
                    'conference': 'Eastern',
                    'division': 'Southeast'
                    }
            ]
}


def getWeek(week):
    teamdata['dates'].append("Week" + str(week))
    url = 'http://espn.go.com/nba/powerrankings/_/week/' + str(week)
    print 'Getting URL: ' + url
    response = urllib2.urlopen(url)
    html = response.read()
    soup = BeautifulSoup(html)

    table = soup.find('table')
    rows = table.find_all('tr')

    for row in rows:
        cols = row.find_all('td')
        if (len(cols) > 2):
            rank = cols[0].string
            team_col = cols[1].find('div', style="padding:10px 0;")
            if (team_col):
                city = team_col.find('a').string
                addRank(city, rank, week - 1)

def addRank(team_name, rank, date_index):
    #fuck LA
    if (team_name == 'Los Angeles'):
        return
    for team in teamdata['teams']:
        if team['city'] == team_name:
            team['values'].append({ 'date': date_index, 'ranking': rank })

getWeek(1)
getWeek(2)
getWeek(3)
getWeek(4)
getWeek(5)
getWeek(6)
getWeek(7)
getWeek(8)

with open('tempData', 'w') as writehandle:
    json.dump(teamdata, writehandle)
