from django.conf.urls import url

from . import views

urlpatterns = [
        url(r'^$', views.chart),
        url(r'^api/rankings/(?P<year>[0-9]+)/(?P<week>[0-9]+)', views.week_rankings),
        url(r'^api/rankings/(?P<year>[0-9]+)', views.year_rankings),
        url(r'^api/rankings/info', views.info),
        ]
