from flask import Flask, request
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)

# Models
class Team(db.Model):
    __tablename__ = 'teams'
    id = db.Column(db.Integer, primary_key=True)
    region = db.column(db.String(200))
    name = db.column(db.String(200))
    color = db.column(db.String(50))
    conference = db.column(db.String(100))
    division = db.column(db.String(100))

    def __init__(self, region, name):
        self.region = region
        self.name = name

    def __str__(self):
        return self.region + ' ' + self.name

class Ranking(db.Model):
    __tablename__ = 'rankings'
    id = db.Column(db.Integer, primary_key=True)
    year = db.column(db.Integer)
    week = db.column(db.Integer)
    team = db.column(Team)
    rank = db.column(db.Integer)
    record = db.column(db.String(20))
    summary = db.column(db.String(5000))

    def __str__(self):
        return str(self.year) + ' week ' + str(self.week) + ': ' + str(self.team) + ' #' + str(self.rank)

    class Meta:
        ordering = ['year', 'week', 'rank']


@app.route('/')
def index():
    return 'Hello World!'

# return team details
@app.route('/teams', methods=['GET'])
def get_teams():
    return 'returning all teams'

# return team details
@app.route('/teams/<team_name>', methods=['GET'])
def get_team(team_name):
    return team_name + '!'

# return rankings
@app.route('/rankings', methods=['GET'])
def get_rankings():
    start_week = request.args.get('start-week')
    end_week = request.args.get('end-week')
    return 'Get the rankings!'

if __name__ == '__main__':
    app.run(debug=True)
