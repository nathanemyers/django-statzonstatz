/* jshint esnext: true */
var data;

var margin = {top: 0, right: 60, bottom: 50, left: 100};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var dataMargin = {top: 10, right: 6, bottom: 5, left: 5};
var dataWidth = width - dataMargin.left - dataMargin.right;
var dataHeight = height - dataMargin.top - dataMargin.bottom;

var current_x_min = 0;

var discrete_mode = false; // this is a kludge to fix centerOn bug
var pinned = false;

var x = d3.scaleLinear()
  .domain([current_x_min, current_x_min + 10])
  .range([dataMargin.left, dataWidth]);

var y = d3.scaleLinear()
  .domain([1, 30])
  .range([dataMargin.top, dataHeight]);

var line = d3.line()
  .curve(d3.curveMonotoneX)
  .x(d => x(d.week))
  .y(d => y(d.rank));

var voronoi = d3.voronoi()
  .x(d => d.x)
  .y(d => d.y)
  .size([3200, height]);

var format = d3.format(".01f");

window.onload = function() {
  d3.json('api/rankings/2016', function(error, json) {
    if (error) {
      return console.warn(error);
    }
    data = json.results;
    $('#spinner-container').css('display', 'none');

    // find initial rankings for greensock
    var start_rankings = new Array(30);
    data.forEach(function(team) {
      let rank = team.rankings[0].rank;
      start_rankings[rank - 1] = '.' + team.slug;
    });
    start_rankings.reverse();

    /*
     * D3.js Code
     */
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
    var yAxis = d3.axisRight(y)
                  .tickValues([1, 5, 10, 15, 20, 25, 30]);

    var gX = outer.append('g')
      .attr('transform', `translate(${margin.left + dataMargin.left}, 
                                    ${dataHeight + margin.top + dataMargin.top + dataMargin.bottom})`)
      .call(xAxis);

    gX.append('text')
        .text('Week')
        .attr('fill', 'black')
        .attr('font-size', 15)
        .attr('transform', `translate(${width / 2}, 40)`);


    var gY = outer.append('g')
      .attr('transform', `translate(${margin.left}, 
                                    ${margin.top + dataMargin.top})`);

    var rankAxis = outer.append('g')
      .attr('transform', `translate(${margin.left + dataMargin.left + width}, 
                                    ${margin.top + dataMargin.top})`)
      .call(yAxis)
      .append('text')
        .text('Rank')
        .attr('fill', 'black')
        .attr('font-size', 15)
        .attr('transform', `translate(40, ${height / 2}) rotate(-90)`);


    var labels = gY.selectAll('.team-label')
      .data(data)
      .enter().append('text')
        .attr('class', d => `${d.slug} team-label`)
        .attr('text-anchor', 'end')
        .attr('transform', d => `translate(0, ${y(d.rankings[current_x_min].rank) + 5})`)
        .text(d => d.name)
        .on('click', team => pin(team.slug))
        .on('mouseover', team => {
            if (team && !pinned) {
              highlightTeam(team.slug);
            }
          })
        .on('mouseout', () => {
            if (!pinned) {
              highlightAll();
            }
          });

    var team = inner.selectAll('.team')
      .data(data)
      .enter().append('g')
        .attr('class', d => `${d.slug} team`);

    team
      .append('path')
        .attr('d', d => line(d.rankings))
        .style('fill', 'none')
        .style('stroke-width', 1.5)
        .style('stroke', d => d.color)
        .attr('team', d => d.slug);

    team.selectAll('circle')
      .data(d => d.rankings)
      .enter().append('circle')
        .attr('cx', d => x(d.week))
        .attr('cy', d => y(d.rank))
        .attr('r', '5px')
        .style('opacity', 0)
        .style('fill', d => d.color);

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

    generateVoronoi();

    function generateVoronoi() {
      var voronoiData = voronoi.polygons(generateVoronoiPoints($('.team path')));
      inner.selectAll('.voronoi').remove();
      inner.selectAll('.voronoi').data(voronoiData)
        .enter().append('g')
          .attr('class', d => 'voronoi')
        .append('path')
          .attr('d', d => d ? "M" + d.join("L") + "Z" : null)
          .on('click', team => pin(team.data.slug))
          .on('mouseover', team => {
              if (team && !pinned) {
                highlightTeam(team.data.slug);
              }
            })
          .on('mouseout', () => {
              if (!pinned) {
                highlightAll();
              }
            });
    }

    window.onclick = function () {
      highlightAll();
      pinned = false;
    };

    function zoomed() {
      team.attr('transform', d3.event.transform);
      inner.selectAll('.voronoi').attr('transform', d3.event.transform);
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
        return `translate(0, ${newY})`;
      });
    }

    /*
     * Panning Logic
     */
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
        d3.event.stopPropagation();
        discrete_mode = true;
        if (current_x_min > 0) {
          current_x_min--;
          centerOn(current_x_min);
        }
      });
    var rightButton = d3.select('#right')
      .on('click', function() {
        d3.event.stopPropagation();
        discrete_mode = true;
        current_x_min++;
        centerOn(current_x_min);
      });

    var zoomButton = d3.select('#zoom')
      .on('click', function() {
        d3.event.stopPropagation();
        zoomOut();
      });

    function zoomOut() {
      var max_x = 24; // fix this
      x.domain([0, max_x]);
      gX.transition()
        .duration(500)
        .call(xAxis)
      // slight kludge, we just want to to do this once
        .on('end', generateVoronoi); 

      team.selectAll('path')
        .transition()
        .duration(500)
        .attr('d', d => line(d.rankings));
        
      team.selectAll('circle')
        .transition()
        .duration(500)
        .attr('cx', d => x(d.week))
        .attr('cy', d => y(d.rank));

    }

    // Animate all this garbage in
    TweenMax.staggerFrom(start_rankings, 1, {opacity: 0}, 0.025);

  });

  function pin(slug) {
    d3.event.stopPropagation();
    highlightAll();
    highlightTeam(slug);
    pinned = true;
  }

  function highlightTeam(slug) {
    d3.selectAll('.team > path')
      .transition()
      .duration(15)
      .ease(d3.easeLinear)
      .style('stroke-width', d => (slug === d.slug) ? '3px' : '1px')
      .style('stroke', d => (slug === d.slug) ? d.color : 'gray');

    d3.selectAll('.team-label')
      .transition()
      .duration(15)
      .attr('fill', d => (slug === d.slug) ? 'black' : 'gray')
      .attr('font-weight', d => (slug === d.slug) ? 900 : 100);

    d3.selectAll(`.${slug} > circle`)
      .transition()
      .duration(200)
      .ease(d3.easeLinear)
      .style('opacity', 1);
  }

  function highlightAll() {
    d3.selectAll('.team path')
      .transition()
      .duration(15)
      .ease(d3.easeLinear)
      .style('stroke', d => d.color)
      .style('stroke-width', '1.5px');

    d3.selectAll('.team-label')
      .transition()
      .duration(15)
      .attr('font-weight', 100)
      .attr('fill', 'black');

    d3.selectAll('.team circle')
      .transition()
      .duration(15)
      .ease(d3.easeLinear)
      .style('opacity', 0);
  }



  /*
   * Voronoi Support Code
   */
  function samplePath(pathNode, precision) {
    var pathLength = pathNode.getTotalLength();
    var samples = [];
    for (let sample, sampleLength = 0; sampleLength <= pathLength; sampleLength += precision) {
      sample = pathNode.getPointAtLength(sampleLength);
      samples.push({
        x: sample.x,
        y: sample.y,
        slug: pathNode.__data__.slug // there is surely a better way to get this
      });
    }
    return samples;
  } 

  function generateVoronoiPoints(paths) {
    var allPoints = [];
    for (var path of paths) {
      allPoints = allPoints.concat( samplePath(path, 15) );
    }
    return allPoints;
  }

};
