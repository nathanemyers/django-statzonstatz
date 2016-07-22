var data;
var margin = {top: 20, right: 20, bottom: 30, left: 50};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;


var svg;

var x = d3.scale.linear()
  .range([0, width]);

var y = d3.scale.linear()
  .domain([1, 30])
  .range([0, height]);

var line = d3.svg.line()
  .x(function(d) {return x(d.week);})
  .y(function(d) {return y(d.rank) ;})
  .interpolate('linear');


window.onload = function() {
  svg = d3.select(".chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json('api/rankings/2016', function(error, json) {
    if (error) {
      return console.warn(error);
    }
    data = json.results;
    init();

    x.domain(d3.extent(data[0].rankings, function(d) {return d.week;}));

    var team = svg.selectAll('.team')
      .data(data)
      .enter().append('g')
        .attr('class', 'team');

    team.append('path')
      .attr('d', function(d) {
        return line(d.rankings);
      })
      .style('fill', 'none')
      .style('stroke', 'blue');

  });
};

function init() {
  console.log(data);
  $('#spinner-container').css('display', 'none');
}

