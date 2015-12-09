from flask import Flask, request
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)

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
