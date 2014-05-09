d3.csv('./data.csv',function(csv_data) {

  var settings = {
    startingYear: 2013;
  }

  var data = d3.nest()
    .key(function(d) {return d['title']})
    .key(function(d) {return d['service_center']})
    .entries(csv_data);

  for (var i=0;i<data.length;i++) {
    data[i].a2008 = (parseFloat(data[i].values[0].values[0].X2008)+parseFloat(data[i].values[1].values[0].X2008))/2;
    data[i].a2009 = (parseFloat(data[i].values[0].values[0].X2009)+parseFloat(data[i].values[1].values[0].X2009))/2;
    data[i].a2010 = (parseFloat(data[i].values[0].values[0].X2010)+parseFloat(data[i].values[1].values[0].X2010))/2;
    data[i].a2011 = (parseFloat(data[i].values[0].values[0].X2011)+parseFloat(data[i].values[1].values[0].X2011))/2;
    data[i].a2012 = (parseFloat(data[i].values[0].values[0].X2012)+parseFloat(data[i].values[1].values[0].X2012))/2;
    data[i].a2013 = (parseFloat(data[i].values[0].values[0].X2013)+parseFloat(data[i].values[1].values[0].X2013))/2;
  }


  d3.select('#barchart')
    .selectAll('div')
      .data(data)
    .enter().append('div')
    .attr('class',function(d) {return 'bars '+d.key.replace(/\s/g,'')})
    .style('width',function(d) {return d['a' + settings.startingYear]*2+'px';})
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
      .data(['2008','2009','2010','2011','2012','2013'])
    .enter().append('div')
      .style({'width':'50px','height':'30px','display':'inline-block','cursor':'pointer'})
      .attr('class',function(d) {return 'year '+d; })
      .text(function(d) {return d;})
//      .on('click',function(d) {

  //    });

})  //end of D3
