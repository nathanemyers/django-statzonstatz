
var data;

window.onload = function() {
  d3.json('api/rankings/2016', function(error, json) {
    if (error) {
      return console.warn(error);
    }
    data = json;
    build_chart('#nba-chart');
  });
};

function build_chart(selector) {
  console.log(data);
  $('#spinner-container').css('display', 'none');

}

