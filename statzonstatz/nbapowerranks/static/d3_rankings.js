var data;
var margin = {top: 0, right: 0, bottom: 30, left: 0};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;


var svg;
var x_min = 0;
var x_max = 10;

var x = d3.scaleLinear()
  .domain([x_min, x_max])
  .range([0, width]);

var y = d3.scaleLinear()
  .domain([1, 30])
  .range([0, height]);

var line = d3.line()
  .x(function(d) {return x(d.week);})
  .y(function(d) {return y(d.rank) ;});


window.onload = function() {
  d3.json('api/rankings/2016', function(error, json) {
    if (error) {
      return console.warn(error);
    }
    data = json.results;
    init();

    svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.axisBottom(x);

    var gX = svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + (height + 10) + ')')
      .call(xAxis);

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

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .call(d3.zoom()
            .on('zoom', zoomed)
            .translateExtent([[0,0], [3200, 600]])
            .scaleExtent([0,0])
           );

    function zoomed() {
      team.attr('transform', d3.event.transform);
      gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    }

  });

};

function init() {
  console.log(data);
  $('#spinner-container').css('display', 'none');
}

