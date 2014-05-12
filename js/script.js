d3.csv('./data.csv',function(csv_data) {

  function plucker(attribute) {
    return function (obj) {
      return obj[attribute];
    }
  }

  var years = [2008, 2009, 2010, 2011, 2012, 2013];
  var settings = {
    startingYear: 2013
  }

  var data = d3.nest()
    .key(plucker('title'))
    .key(plucker('service_center'))
    .entries(csv_data);

  _.each(data, function (datum) {
    _.each(years, function (year) {
      var xYear = 'X' + year,
          aYear = 'a' + year,
          value0 = datum.values[0].values[0][xYear],
          value1 = datum.values[1].values[0][xYear],
          value0 = parseFloat(value0),
          value1 = parseFloat(value1);

      datum[aYear] = (value0 + value1) / 2;
    });
  });


  d3.select('#barchart')
    .selectAll('div')
      .data(data)
    .enter().append('div')
    .attr('class',function(d) {return 'bars '+d.key.replace(/\s/g,'')})
    .style('width',function(d) {return d['a'+settings.startingYear]*2+'px';})
    .style('height','30px')
    .style('background','#ccc')
      .append('div')
        .attr('class',function(d) {return 'text title '+d.key.replace(/\s/g,'')})
        .style('width','400px')
        .style('height','30px')
        .style('text-align','right')
        .text(function(d) {return d.key.toLowerCase();});


  d3.select("#year-selector")
    .selectAll('div')
      .data(years)
    .enter().append('div')
      .style({'width':'50px','height':'30px','display':'inline-block','cursor':'pointer'})
      .attr('class',function(d) {return 'year '+d; })
      .text(function(d) {return d;})
//      .on('click',function(d) {

  //    });

})  //end of D3
