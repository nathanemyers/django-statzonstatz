function build_smash_power_rankings(select_target, bounds) {

    // Utility function to update elements within a bundle to a highlight state
    var highlightBundle = function(bundle) {
        var colored_line = d3.select(bundle.color_line);

        // Move colored line to front so it renders on top
        var node = colored_line.node();
        node.parentNode.parentNode.appendChild(node.parentNode);

        // Increase hovered line width
        colored_line.style("stroke-width", "3.5px");

        // Make label 'pop'
        d3.select(bundle.label).style("font-weight", "bold");
        d3.select(bundle.label).style("font-size", "110%");
    };

    // Utility function to update elements within a bundle to a faded state
    var fadeBundle = function(bundle) {
        // Fade to grey
        d3.select(bundle.color_line).style("stroke", "#d3d3d3");
    };

    // Utility function to update elements within a bundle to their default state
    var resetBundle = function(bundle) {
        var colored_line = d3.select(bundle.color_line);

        // Reset to default width
        colored_line.style("stroke-width", ""); 

        // Reset color change
        colored_line.style("stroke", d3.select(bundle.hover_line).style("stroke"));
        
        // Reset label
        d3.select(bundle.label).style("font-weight", "");
        d3.select(bundle.label).style("font-size", "");
    };

    $.getJSON("nba_data.json", function(data) {
        var nba_data_set = data;

        var total_width = bounds.plot.width + bounds.margin.left + bounds.margin.right;
        var total_height = bounds.plot.height + bounds.margin.top + bounds.margin.bottom;

        // Define X/Y range for domain->range mappings
        var x = d3.scale.linear()
                .range([0, bounds.plot.width]);

        var y = d3.scale.linear()
                .range([0, bounds.plot.height]);

        // X-Axis along bottom of chart
        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

        // Y-Axis displayed by right edge of chart
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("right")
            .ticks(5);

        // Template (I guess?) for making lines. We'll have one line per entry
        var line = d3.svg.line()
            .interpolate("linear")
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.ranking); });

        // Outer container SVG element to enable responsive magic
        var div_target = d3.select(select_target)
            .attr("style", "max-width:" + total_width + "px;max-height:" + total_height + "px");

        var svg_root = div_target.append("svg")
            .attr("viewBox", "0 0 " + total_width + " " + total_height)
            .attr("preserveAspectRatio", "");   // $$$FTS - Consider removing entirely. Must test mobile.

        // Group within SVG used as basis
        var plot_group = svg_root.append("g")
            .attr("transform", "translate(" + bounds.margin.left + "," + bounds.margin.top + ")");

        // Add one tick per date entry to x-axis
        xAxis.ticks(nba_data_set.dates.length)
            .tickFormat(function(d) { return nba_data_set.dates[d]; });

        var all_rankings = nba_data_set.teams
            .map(function(team, index, arr) {
                return {
                    full_name: team.city + ' ' + team.name,
                    color: team.color,
                    values: team.values,
                    conference: team.conference,
                    division: team.division
                }
            });

        // Remember, domain->range. Define x axis domain
        // Ouput: [earliest_date, latest_date]
        var x_domain = [
            d3.min(all_rankings, function(c) { return d3.min(c.values, function(v) { return v.date; }); }),
            d3.max(all_rankings, function(c) { return d3.max(c.values, function(v) { return v.date; }); })
        ];
        x.domain(x_domain);

        // nathan's own domain
        y.domain([1, 30]);

        // Define domain->range for character_name -> color
        var colors = d3.scale.ordinal()
                        .domain(nba_data_set.teams.map(function(entry) { return entry.name; }))
                        .range(nba_data_set.teams.map(function(entry) { return entry.color;} ));



        // Setup x-axis
        plot_group.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (bounds.plot.height + 10) + ")")    // shifted down slightly
            .call(xAxis)
            .selectAll(".tick text")
            .style("text-anchor", "mid");   // start, mid, or end

        // Setup y-axis
        plot_group.append("g")
            .attr("class", "y axis axisRight")
            .attr("transform", "translate( " + (bounds.plot.width + 10) + ",0)")
            .call(yAxis)
        .append("text")
            .attr("transform", "translate(0," + -10 + ")")
            .style("text-anchor", "middle")
            .text("Ranking");

        // Bind all_rankings data to DOM
        var character_ranks = plot_group.selectAll(".character_ranks")
                .data(all_rankings)
            .enter().append("g")
                .attr("class", "character_ranks");

        // Add a colored line for each full_name
        character_ranks.append("path")
            .attr("class", "rank_line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return colors(d.full_name); })

        // Add an invisible 'fat' line per full_name for handling mouse over events
        character_ranks.append("path")
            .attr("class", "hover_line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return colors(d.full_name); })
            .on("mouseover", function(d) { 

                // Highlight mouse over target, fade everything else
                for (var i = 0; i < line_bundles.length; ++i) {
                    if (line_bundles[i].hover_line == this)
                        highlightBundle(line_bundles[i]);
                    else 
                        fadeBundle(line_bundles[i]);
                }
            })
            .on("mouseout", function(d) { 
                // Reset all highlights/fades
                line_bundles.forEach(function(bundle) { resetBundle(bundle); });
                d3.select(".char_header").text("");
            });

        // Add text label for each full_name
        var label_offset = 0;
        character_ranks.append("text")
            .attr("class", "char_label")
            .datum(function(d) { return {name: d.full_name, value: d.values[0]}; })
            .attr("transform", function(d) {
                // Calculate index along y-axis to display name.
                // Default to align with line position for x=0
                // But move to end of list if line doesn't start until x > 0
                var y_index = ((d.value.date == 0 )? d.value.ranking : (nba_data_set.teams.length + label_offset--));
                return "translate(" + x(0) + "," + y(y_index) + ")"; 
            })
            .attr("x", -10)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d.name; });
            

        var label_hover_offset = 0;
        character_ranks.append("rect")
            .attr("class", "char_label_hover")
            .datum(function(d) { return {name: d.full_name, value: d.values[0]}; })
            .attr("x", -10 - bounds.margin.left)
            .attr("transform", function(d) {
                // Calculate index along y-axis to display name.
                // Default to align with line position for x=0
                // But move to end of list if line doesn't start until x > 0
                var y_index = ((d.value.date == 0 )? d.value.ranking : (nba_data_set.teams.length + label_hover_offset--));
                return "translate(" + x(0) + "," + (y(y_index) - (0.5*(y(1) - y(0))) + 1) + ")"; 
            })
            .attr("width", bounds.margin.left)
            .attr("height", (y(1) - y(0) + 1))
            .on("mouseover", function(d) {
                // Highlight mouse over target, fade everything else
                for (var i = 0; i < line_bundles.length; ++i) {
                    if (line_bundles[i].full_name == d.name)
                        highlightBundle(line_bundles[i]);
                    else
                        fadeBundle(line_bundles[i]);
                }
            })
            .on("mouseout", function(d) {
                // Reset all highlights/fades
                line_bundles.forEach(function(bundle) { resetBundle(bundle); });
                d3.select(".char_header").text("");
            });
        
        // Color
        var line_bundles = plot_group.selectAll(".rank_line")[0].map( function(entry) { return { color_line: entry } } );
        
        // Hover
        var hover_lines = plot_group.selectAll(".hover_line")[0];
        hover_lines.forEach(function(hover_line, index) { line_bundles[index].hover_line = hover_line; });
        
        line_bundles.forEach(function(bundle_entry, index) { bundle_entry.full_name = all_rankings[index].full_name; });

        // Character Lebel
        var labels = plot_group.selectAll(".char_label")[0];
        labels.forEach(function(label, index) { line_bundles[index].label = label; });

    });
}
