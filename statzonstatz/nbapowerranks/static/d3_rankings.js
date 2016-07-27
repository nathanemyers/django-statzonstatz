var data;

var margin = {top: 0, right: 0, bottom: 0, left: 100};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var dataMargin = {top: 10, right: 6, bottom: 50, left: 0};
var dataWidth = width - dataMargin.left - dataMargin.right;
var dataHeight = height - dataMargin.top - dataMargin.bottom;

var x_min = 0;
var x_max = 10;

var x = d3.scaleLinear()
  .domain([x_min, x_max])
  .range([dataMargin.left, dataWidth]);

var y = d3.scaleLinear()
  .domain([1, 30])
  .range([dataMargin.top, dataHeight]);

var line = d3.line()
  .curve(d3.curveMonotoneX)
  .x(function(d) {return x(d.week);})
  .y(function(d) {return y(d.rank) ;});


window.onload = function() {
  d3.json('api/rankings/2016', function(error, json) {
    if (error) {
      return console.warn(error);
    }
    data = json.results;
    init();


    var outer = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var inner = outer.append("svg")
        .attr("width", dataWidth + dataMargin.left + dataMargin.right)
        .attr("height", dataHeight + dataMargin.top + dataMargin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .append('g')
        .attr("transform", "translate(" + dataMargin.left + "," + dataMargin.top + ")");
        

    var xAxis = d3.axisBottom(x);

    var gX = outer.append('g')
      .attr('transform', 'translate(' + dataMargin.left + ',' + (height - margin.bottom - dataMargin.bottom + 5) + ')')
      .call(xAxis);

    var team = inner.selectAll('.team')
      .data(data)
      .enter().append('g')
        .attr('class', 'team');

    team.append('path')
      .attr('d', function(d) {
        return line(d.rankings);
      })
      .style('fill', 'none')
      .style('stroke', 'blue');

    var zoom = d3.zoom()
      .on('zoom', zoomed)
      //.on('end', center)
      .translateExtent([[0,0], [3200, height + margin.top + margin.bottom]])
      .scaleExtent([0,0]);

    inner.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .call(zoom);

    function zoomed() {
      team.attr('transform', d3.event.transform);
      gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    }
    
    var format = d3.format(".01f");
    function center() {
      var base = format(x.invert(-d3.event.transform.x));
      roundedBase = format(Math.round(base));
      if (base == roundedBase) {
        return;
      }
      zoom.translateBy(team, base - roundedBase);
    }
    d3.select('#center')
      .on('click', center);

  });

};

function init() {
  console.log(data);
  $('#spinner-container').css('display', 'none');
}

