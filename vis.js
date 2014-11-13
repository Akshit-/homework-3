var redditSvg;
var previousData;

var POLL_SPEED = 2000;

var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width =460 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom;


function redditVis() {
  // setup a poll requesting data, and make an immediate request
  setInterval(requestData,POLL_SPEED);
  requestData();

  // initial setup only needs to happen once 
  // - we don't want to append multiple svg elements
  // redditSvg = d3.select("body")
  //       .append("svg")
  //       .attr("width",document.body.clientWidth - 50)
  //       .attr("height",document.body.clientWidth -50)
  //       .append("g")
  //       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  redditSvg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

}

function requestData() {
  // our jsonp url, with a cache-busting query parameter
  d3.jsonp("http://www.reddit.com/.json?jsonp=runVis&noCache=" + Math.random());
}


//////// PLEASE EDIT runVis /////////
/////////////////////////////////////
/////////////////////////////////////

function runVis(data1) {

  // d3 never does anything automagical to your data
  // so we'll need to get data into the right format, with the
  // previous values attached
  var formatted = formatRedditData(data1,previousData);



  //console.log(data);

  // select our stories, pulling in previous ones to update
  // by selecting on the stories' class name
  // var stories = redditSvg
  //    .selectAll("text")
  //    // the return value of data() is the update context - so the 'stories' var is
  //    // how we refence the update context from now on
  //    .data(formatted,function(d) {
  //      // prints out data in your console id, score, diff from last pulling, text
       
  //      //console.log(d.id,d.score,d.diff,d.title);

  //      // use a key function to ensure elements are always bound to the same 
  //      // story (especially important when data enters/exits)
  //      return d.id;
  //    });


  var values = data1.data.children.map(function(story) {
    return story.data.score;
  });  

   console.log(values);

// A formatter for counts.
// Generate a Bates distribution of 10 random variables.

//var values = d3.range(1000).map(d3.random.bates(10));

//console.log(values);

// A formatter for counts.
var formatCount = d3.format("");

var x = d3.scale.linear()
    .domain([0, d3.max(values)])
    .range([0, width]);

// Generate a histogram using twenty uniformly-spaced bins.
var data = d3.layout.histogram()
    .bins(x.ticks(20))
    (values);

console.log(data);

var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) {return d.y; })])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");


var bars = redditSvg.selectAll(".bar")
    .data(data);


 var bars1 = bars.enter();

    bars1.append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
    .append("rect");


  bars1.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

bars.transition().duration(500)
    .selectAll("rect")
    .attr("x", 1)
    .attr("width", x(data[0].dx) - 1)
    .attr("height", function(d) { return height - y(d.y); })
    

bars.exit().select(".xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .remove();

// redditSvg.append("g")
//     .attr("class", "xaxis")
//     .attr("transform", "translate(0," + height + ")")
//     .call(xAxis);

// bar.append("text")
//     .attr("dy", ".75em")
//     .attr("y", function(d) { return height - y(d.y) + 100; })
//     .attr("x", x(data[0].dx) / 2)
//     .attr("text-anchor", "middle")
//     .text(function(d) { return formatCount(d.y); });

bars.exit().transition().duration(500)
    .selectAll("rect")
    .attr("height", function(d) { return height - y(d.y); })
    .remove();
//bars.exit().remove();
 //bar.attr("height", function(d) { return height - y(d.y); });
  //bar.text(function(d) { return formatCount(d.y); });
// ;



  //console.log(stories);

  // ENTER context
  // stories.enter()
  //   .append("text")
  //   .text(function(d){return d.score + " " + d.diff + " " + d.title +"="+ d.subreddit})
  //   .attr("y", function(d,i){return 1.5*i + 1 + "em"})
  //   .style("color","black");

  

  // UPDATE + ENTER context
  // elements added via enter() will then be available on the update context, so
  // we can set attributes once, for entering and updating elements, here
  // stories
  //   .text(function(d){return d.score + " " + d.diff + " " + d.title + "="+ d.subreddit})

  // EXIT content

  
   // stories.exit()
   //   .remove();
}

//////// PLEASE EDI runVis() /////////
/////////////////////////////////////
/////////////////////////////////////

function classes(root) 
{
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}


function formatRedditData(data) {
  // dig through reddit's data structure to get a flat list of stories
  var formatted = data.data.children.map(function(story) {
    return story.data;
  });
  // make a map of storyId -> previousData
  var previousDataById = (previousData || []).reduce(function(all,d) {
    all[d.id] = d;
    return all;
  },{});
  // for each present story, see if it has a previous value,
  // attach it and calculate the diff
  formatted.forEach(function(d) {
    d.previous = previousDataById[d.id];
    d.diff = 0;
    if(d.previous) {
      d.diff = d.score - d.previous.score;
    }
  });
  // our new data will be the previousData next time
  previousData = formatted;
  return formatted;
}

redditVis();
