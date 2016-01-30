from django.test import TestCase
from django.core.management import call_command
from nbapowerranks.models import Team

# Create your tests here.
class ManagementCommandTests(TestCase):

    def test_init_teams(self):
       call_command('init_teams') 
       self.assertEqual(len(Team.objects.all()), 30)

