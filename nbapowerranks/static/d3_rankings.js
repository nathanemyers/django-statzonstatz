function build_chart(selector) {
  var border_left = 120;
  var border_right = 50;
  var border_top = 10;
  var border_bottom = 40;

  var svgContainer = d3.select(selector);
  var height = parseInt(svgContainer.style('height'));

  // these vars will be inited when we find_chart_size 
  var width;
  var max_weeks;
  var most_recent_week;

  // need to wait to find the width of chart
  var x;
  var xAxis;

  var y = d3.scale.linear()
    .domain([1,30])
    .range([border_top, height - border_bottom]);
    
  var yAxis = d3.svg.axis()
    .ticks(6)
    .orient('right')
    .scale(y);

  // can't have a css class named 76ers
  function team2class(team) {
    var class_name = team;
    class_name = (class_name === '76ers') ? 'philly' : class_name;
    class_name = (class_name === 'Trail Blazers') ? 'Blazers' : class_name;
    return class_name;
  }

  // builds list of classes to apply to line
  function lineClass(data) {
    var classes = 'team ';
    classes += team2class(data.name);
      if (data.conference === 'Eastern') {
        classes += ' eastern';
      }
      if (data.conference === 'Western') {
        classes += ' western';
      }
      return classes;
  }

  // redraws team line so it won't be covered
  function bring_to_fore(team) {
    var visible = svgContainer.select('.visible_data');
    var team_node = visible.select('g.' + team ).node();
    team_node.parentNode.appendChild(team_node);
  }

  // init the tooltip
  var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return '<div class="d3-tip-header">' + 
        '#' + d.rank + ' ' + d.name + ' (' + d.record + ')' + 
        '</div>' + 
        d.summary;
    });
  svgContainer.call(tooltip);

  function find_chart_size() {
    $.getJSON("/api/rankings/info", function(data) {
      most_recent_week = data.most_recent_week;
      width = parseInt(svgContainer.style('width'));

      max_weeks = Math.floor(width / 100);
      end_week = Math.max(most_recent_week, max_weeks);

      if (max_weeks > 18) {
        max_weeks = 18;
      }
      // we're inclusive on both ends, so we need to knock max_weeks down 1
      var start_week = most_recent_week - (max_weeks - 1);
      start_week = (start_week < 0) ? 0 : start_week;

      x = d3.scale.linear()
        .domain([start_week, end_week])
        .range([border_left, width - border_right]);
      xAxis = d3.svg.axis()
        .ticks(end_week - start_week)
        .scale(x);

      render_chart('2016', start_week, most_recent_week);
    });
  }

  function render_chart(year, start_week, end_week) {
    var api_url = '/api/rankings/' + year + '?' + 
      'start_week=' + start_week + ';end_week=' + end_week;
    $.getJSON(api_url, function(data) {
      data = data.results;

      // line draw function
      var line = d3.svg.line()
        .x(function(d) {return x(d.week);})
        .y(function(d) {return y(d.rank) ;})
        .interpolate('linear');

      var visible = svgContainer
        .append('g')
        .attr('class', 'visible_data');

      var team_lines = visible.selectAll('g')
        .data(data)
        .enter().append('g')
          .attr('class', lineClass);

      var color_lines = team_lines
        .append('path')
          .attr('d', function(d) { return line(d.rankings); });

      var labels = team_lines
        .append('text')
          .attr('x', function(d) {return border_left - 5;}) // -5 to add margin
          .attr('y', function(d) {
            return y(d.rankings[0].rank) + 5; // +5 to center text
          })
          .attr('class', lineClass)
          .style('text-anchor', 'end')
          .on('mouseenter', function(d) {
            bring_to_fore(team2class(d.name));
            $('.chart').addClass('highlight ' + team2class(d.name));
          })
          .on('mouseout', function(d) {
            $('.chart').removeClass('highlight ' + team2class(d.name));
          })
          .text(function(d) {return d.name;});

      var bubbles = team_lines.selectAll('circle')
        .data(function(d) {return d.rankings;})
        .enter().append('circle')
          .attr('cx', function(d) {
            return x(d.week);
          })
          .attr('cy', function(d) {
            return y(d.rank);
          })
          .attr('r', '8')
          .style('fill', 'none');
          

      // This grouping is for all mouse related callbacks, contains a bunch of
      // fat lines and circles layered over the colored display versions.
      // We have to declare this stuff after the colored lines so they'll take
      // precidence in the DOM
      var line_handles = svgContainer.selectAll('.line-handle')
        .data(data)
        .enter().append('g');

      line_handles
        .append('path')
        .attr('d', function(d) { return line(d.rankings); })
        .attr('class', 'line-handle')
        .on('mouseenter', function(d) {
          bring_to_fore(team2class(d.name));
          $('.chart').addClass('highlight ' + team2class(d.name));
        })
        .on('mouseout', function(d) {
          $('.chart').removeClass('highlight ' + team2class(d.name));
        });
          
      line_handles.selectAll('circle')
        .data(function(d) {return d.rankings;})
        .enter().append('circle')
          .attr('cx', function(d) {
            return x(d.week);
          })
          .attr('cy', function(d) {
            return y(d.rank);
          })
          .attr('r', '6')
          .style('fill', 'red')
          .style('opacity', '0')
          .on('mouseenter', function(d) {
            var name = d3.select(this.parentNode).datum().name;
            bring_to_fore(team2class(name));
            $('.chart').addClass('highlight ' + team2class(name));
            tooltip.show(d);
          })
          .on('mouseout', function(d) {
            var name = d3.select(this.parentNode).datum().name;
            $('.chart').removeClass('highlight ' + team2class(name));
            tooltip.hide();
          });

      svgContainer.append('g')
        .attr('class', 'axis')
        // -12 for 12px border
        .attr('transform', 'translate(0,' + ( height - (border_bottom - 12) ) + ')')
        .call(xAxis);

        svgContainer.append('text')
          .attr('x', width / 2)
          .attr('y', height)
          .text('Week');


      yAxisSvg = svgContainer
        .append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(' + ( width - border_right ) + ',0)')
          .call(yAxis);

      svgContainer.append('text')
        .attr('x', 0 - (height / 2))
        .attr('y', width - 10)
        .attr('transform', 'rotate(-90)')
        .text('Rank');

    });
  }

  // kicks off render
  find_chart_size();
  
  $("#team-info-display").click(function() {
    $("#team-info-display").css('display', 'none');
  });





  $(window).on('orientationchange', function(event) {
    var temp;
    temp = svgContainer.selectAll('text');
      temp.remove();
    temp = svgContainer.selectAll('g');
      temp.remove();
    find_chart_size();
  });



}

