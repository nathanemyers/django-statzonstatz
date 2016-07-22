from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .models import Team, Ranking

# Create your views here.
def chart(request):
    return render(request, 'chart/nba_power_rankings.html', {
        'version': '2.0'
        })

def info(request):
    most_recent = Ranking.objects.last()
    return JsonResponse({'most_recent_week': most_recent.week})

def week_rankings(request, year, week):
    rankings = Ranking.objects.filter(year=year, week=week)
    formatted_rankings = {}
    for rank in rankings:
        formatted_rankings[rank.team.name] = rank.rank

    return JsonResponse({'rankings': formatted_rankings})

def year_rankings(request, year):
    start_week = request.GET.get('start_week', 0)
    end_week = request.GET.get('end_week', 50) # I'm not sure exactly how many weeks there will be

    rankings = Ranking.objects.filter(
            year=year,
            week__gte=start_week,
            week__lte=end_week 
            )
    formatted_rankings = {}
    

    # Ok, this is textbook what-not-to-do in forming your return
    # queries but I am tired of fighting the django ORM right now
    # so I'm just going to do it manually. For future reference,
    # look at django's model 'prefetch_related'
    for rank in rankings:
        if rank.team.name in formatted_rankings:
            formatted_rankings[rank.team.name].append({
                 # for D3 simplicity duplicate the name 
                'name': rank.team.region + ' ' + rank.team.name,
                'week': rank.week,
                'rank': rank.rank,
                'record': rank.record,
                'summary': rank.summary,
                })
        else:
            formatted_rankings[rank.team.name] = [{
                'name': rank.team.region + ' ' + rank.team.name,
                'week': rank.week,
                'rank': rank.rank,
                'record': rank.record,
                'summary': rank.summary,
                }]

    list_rankings = []
    for team in formatted_rankings:
        team_data = Team.objects.get(name=team)
        list_rankings.append({
            'name': team_data.name,
            'conference': team_data.conference,
            'division': team_data.division,
            'color': team_data.color,
            'rankings': formatted_rankings[team]
            })
    # I hope you're happy, django.

    return JsonResponse({'results': list_rankings})
