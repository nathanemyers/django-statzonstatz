/* jshint esnext: true */
var data;

var margin = {top: 0, right: 0, bottom: 0, left: 100};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var dataMargin = {top: 10, right: 6, bottom: 50, left: 0};
var dataWidth = width - dataMargin.left - dataMargin.right;
var dataHeight = height - dataMargin.top - dataMargin.bottom;

var x_min = 0;
var x_max = 10;
var current_x_min = x_min;

var discrete_mode = false; // this is a kludge to fix centerOn bug

var x = d3.scaleLinear()
  .domain([x_min, x_max])
  .range([dataMargin.left, dataWidth]);

var y = d3.scaleLinear()
  .domain([1, 30])
  .range([dataMargin.top, dataHeight]);

var line = d3.line()
  .curve(d3.curveMonotoneX)
  .x(d => x(d.week))
  .y(d => y(d.rank));

var voronoi = d3.voronoi()
  .x(d => x(d.week))
  .y(d => y(d.rank))
  .size([3200, height]);

var format = d3.format(".01f");

window.onload = function() {
  d3.json('api/rankings/2016', function(error, json) {
    if (error) {
      return console.warn(error);
    }
    data = json.results;
    $('#spinner-container').css('display', 'none');

    var allPoints = [];
    data.forEach(function(d){
      allPoints = allPoints.concat(d.rankings);
    });

    var voronoiData = voronoi.polygons(allPoints);

    // find initial rankings for greensock
    var start_rankings = new Array(30);
    data.forEach(function(team) {
      let rank = team.rankings[0].rank;
      start_rankings[rank - 1] = '.' + team.slug;
    });
    start_rankings.reverse();

    var outer = d3.select(".chart").append("svg")
        .attr("style", "border: 1px solid black;")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var inner = outer
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .append("svg")
        .attr("width", dataWidth + dataMargin.left + dataMargin.right)
        .attr("height", dataHeight + dataMargin.top + dataMargin.bottom)
      .append('g')
        .attr("transform", `translate(${dataMargin.left}, ${dataMargin.top})`);


    var xAxis = d3.axisBottom(x);

    var gX = outer.append('g')
      .attr('transform', `translate(${margin.left + dataMargin.left}, ${height - margin.bottom - dataMargin.bottom + 5})`)
      .call(xAxis);

    var gY = outer.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top + dataMargin.top})`);


    var labels = gY.selectAll('.team-label')
      .data(data)
      .enter().append('text')
        .attr('class', d => `${d.slug} team-label`)
        .attr('text-anchor', 'end')
        .attr('transform', d => `translate(0, ${y(d.rankings[current_x_min].rank)})`)
        .text(d => d.name);


    var team = inner.selectAll('.team')
      .data(data)
      .enter().append('g')
        .attr('class', d => `${d.slug} team`)
      .append('path')
        .attr('d', d => line(d.rankings))
        .style('fill', 'none')
        .style('stroke-width', 1.5)
        .style('stroke', d => d.color);

    var zoom = d3.zoom()
      .on('zoom', zoomed)
      .on('end', centerOnNearestBase)
      .translateExtent([[0,0], [3200, height + margin.top + margin.bottom]])
      .scaleExtent([1,1]);

    var zoomHandle = inner.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'zoom-handle')
      .call(zoom);

    function highlight(team) {
      console.log(team);
    }

    var voronoiPoly = zoomHandle.selectAll('.voronoi')
      .data(voronoiData)
      .enter().append('path')
        .attr('class', 'voronoi')
        .attr('d', function(d) { return d ? "M" + d.join("L") + "Z" : null; })
        .on('mouseover', highlight(team));

    function zoomed() {
      team.attr('transform', d3.event.transform);
      voronoiPoly.attr('transform', d3.event.transform);
      gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));

      var x_min = format(x.invert(-d3.event.transform.x));
      var xFloor = Math.floor(x_min);
      var xCeil = Math.ceil(x_min);
      var percent = d3.easeCubic(x_min % 1);

      labels.attr('transform', function(d) {
        var floor = y(d.rankings[xFloor].rank);
        var ceil = y(d.rankings[xCeil].rank);
        var travel = ceil - floor;
        var newY = floor + ( travel * percent );
        return 'translate(0, ' + newY + ')';
      });
    }

    function centerOnNearestBase() {
      if (discrete_mode) {
        // there's a bug here where if you hit the pan buttons too fast
        // we get into an infinite loop trying to center while another
        // zoom event is happening
        return;
      }
      var base = format(x.invert(-d3.event.transform.x)); // where the left hand of the axis lies
      var roundedBase = format(Math.round(base));
      if (Math.abs(x(roundedBase - base)) > 1)  {
        // if we're more than 1 pixel off
        centerOn(roundedBase);
      }
    }

    function centerOn(base) {
      var mX = x(base); 
      var t = d3.zoomIdentity.translate(-mX, 0);
      zoomHandle
        .transition()
        .duration(200)
        .call(zoom.transform, t);
    }

    // Desktop Panning Controls
    var leftButton = d3.select('#left')
      .on('click', function() {
        discrete_mode = true;
        current_x_min--;
        console.log('moving to ' + current_x_min);
        centerOn(current_x_min);
      });
    var rightButton = d3.select('#right')
      .on('click', function() {
        discrete_mode = true;
        current_x_min++;
        console.log('moving to ' + current_x_min);
        centerOn(current_x_min);
      });

    TweenMax.staggerFrom(start_rankings, 1, {opacity: 0}, 0.025);

  });

};
