d3.csv('./data.csv',function(csv_data) {

  function plucker(attribute) {
    return function (obj) {
      return obj[attribute];
    }
  }

  var years = [2008, 2009, 2010, 2011, 2012, 2013];
  var ayears = ['a2008','a2009','a2010','a2011','a2012','a2013'];
  var settings = {
    startingYear: 2013,
    startingOcc: "Accountants, Auditors, And Related Jobs"
  }

//read and process data
  var dataOriginal = d3.nest()
    .key(plucker('title'))
    .key(plucker('service_center'))
    .entries(csv_data);

  _.each(dataOriginal, function (datum) {
    _.each(years, function (year) {
      var xYear = 'X' + year,
          aYear = 'a' + year,
          value0 = datum.values[0].values[0][xYear],
          value1 = datum.values[1].values[0][xYear],
          value0 = parseFloat(value0),
          value1 = parseFloat(value1);

      datum[aYear] = (value0 + value1) / 2;
    });
    datum.keyAbb = datum.key.replace(/\s/g,'');
  });

///Draw bar grahp
  var svgbars = d3.select('#barchart').append('svg').attr('width','100%').attr('height','5450px');


  var changeYear = function(thisyear) {

    //update data of the new order
    var data = dataOriginal
      .sort(function(a,b) {
        return d3.descending(a['a'+thisyear],b['a'+thisyear]);
      });

    var bars = svgbars
      .selectAll('rect.bars')
      .data(data);

    bars
      .transition().duration(1000)
      .delay(function(d,i) {return i*400/25;})
      .attr('y',function(d,i) {return 30+i*50;})
      .attr('width',function(d) {return d['a'+thisyear]*1.53+'px';});

    bars
      .enter().append('rect')
      .attr('class',function(d) {return 'bars '+d.keyAbb})
      .attr('x',0)
      .attr('y',function(d,i) {return 30+i*50;})
      .attr('height','28px')
      .attr('width',function(d) {return d['a'+thisyear]*1.53+'px';})
      .attr('cursor','pointer')
      .style('fill','#cccccc')
      .on('mouseover',function(d) {
        d3.select(this).style('fill','#F79151');
      })
      .on('mouseout',function(d) {
        d3.select(this).transition().duration(250).style('fill','#cccccc');
      })
      .on('click',function(d) {
        changeOcc(d.key);
      });

    bars
      .exit()
      .transition().duration(750)
      .remove();

    //value text
    var barValue = svgbars
      .selectAll('text.value')
      .data(data);
    //transition
    barValue
      .transition().duration(1000)
      .delay(function(d,i) {return i*400/25;})
      .attr('x',function(d) {
        return d['a'+thisyear]>10 ?
        (d['a'+thisyear]-2)*1.53+'px' :
        (d['a'+thisyear]+2)*1.53+'px'
      })
      .attr('y',function(d,i) {return 20+i*50})
      .attr('text-anchor',function(d){
        return d['a'+thisyear]>7? 'end':'start'
      })
      .style('fill-opacity',1)
      .text(function(d) {return Math.round(d['a'+thisyear]);});
    //enter
    barValue
      .enter().append('text')
      .attr('class',function(d) {return 'value '+d.keyAbb})
      .attr('pointer-event','none')
      .attr('x',function(d) {
        return d['a'+thisyear]>7 ?
        (d['a'+thisyear]-2)*1.53+'px' :
        (d['a'+thisyear]+2)*1.53+'px'
      })
      .attr('y',function(d,i) {return 20+i*50})
      .attr('text-anchor',function(d){
        return d['a'+thisyear]>7? 'end':'start'
      })
      .attr('dy',30)
      .style('font-size','14px')
      .text(function(d) {return Math.round(d['a'+thisyear]);});
    //exit
    barValue
      .exit()
      .transition().duration(750)
      .remove();

    //label text
    var barLabel = svgbars
      .selectAll('text.title')
        .data(data);
    //transition
    barLabel
      .transition().duration(1000)
      .delay(function(d,i) {return i*400/25;})
      .attr('y',function(d,i) {return 27+i*50})
      .style('fill-opacity',1)
      .text(function(d) {return d.key;});
    //enter
    barLabel
      .enter().append('text')
      .attr('class',function(d) {return 'title '+d.keyAbb})
      .attr('pointer-event','none')
      .attr('x',0)
      .attr('y',function(d,i) {return 27+i*50})
      .attr('text-anchor','start')
      .style('font-size','14px')
      .style('fill-opacity',1)
      .text(function(d) {return d.key;});
    //exit
    barLabel
      .exit()
      .transition().duration(1000)
      .style('fill-opacity',0)
      .remove();

  }//end of changeYear()


  /// DRAW LINE CHART
  var svglines = d3.select('#linechart').append('svg').attr('width','340px').attr('height','260px');
  //add occupation name on the title
  var textsnap = d3.select('#theocc').append('svg').attr('width','450px').attr('height','25px')
    .append('text')
    .attr('class','theocc')
    .attr('x',0)
    .attr('y',15);


var changeOcc = function(thisocc) {

  var lineData = _.where(dataOriginal,{ key:thisocc })[0];
      lineData.year = years;
      lineData.wait = [lineData.a2008,lineData.a2009,lineData.a2010,lineData.a2011,lineData.a2012,lineData.a2013];

  //update occupation name on the title
  textsnap.text(lineData.key);

  //draw line
  var w=300,h=200,margin=20;
  var x = d3.time.scale().domain([2008,2013]).range([0+margin,w-margin]);
  var y = d3.scale.linear().range([h,0+margin]);
      y.domain([0,d3.max(lineData.wait)]);
  var xAxis = d3.svg.axis()
    .ticks(6)
    .tickFormat(d3.format("0000"))
    .scale(x)
    .orient('bottom');
  var yAxis = d3.svg.axis().tickSize(w).ticks(3).scale(y).orient('right');
  var line = d3.svg.line()
      .x(function(d,i) {return x(years[i]);})
      .y(function(d) {return y(d);});

  svglines.append('g')
    .attr('class','x axis')
    .attr('transform','translate(0,'+ h +')')
    .call(xAxis);

  svglines.append('g')
    .attr('class','y axis')
    .call(yAxis)
    .append('text')
    .attr('y',20)
    .text('Time (Days)');

  svglines.append('path')
    .datum(lineData.wait)
    .attr('class','line')
    .attr('d',line);


  //add dots
  svglines.selectAll('circle.dots')
    .data(lineData.wait).enter()
    .append('circle')
    .attr('class','dots')
    .attr('r',3.5)
    .attr('cx',function(d,i) {return x(years[i]);})
    .attr('cy',function(d,i) {return y(d);})
    .attr('fill','orange');
  //add dot-text
  svglines.selectAll('text.text-dots')
    .data(lineData.wait).enter()
    .append('text')
    .attr('class','text-dots')
    .attr('x',function(d,i) {return x(years[i]);})
    .attr('y',function(d,i) {return y(d)-5;})
    .text(function(d) {return Math.round(d);})
    .style('font-size','12px')
    .style('text-anchor','middle');


  ///##### DRAW BUBBLE CHART

  var svgbubbles = d3.select('#bubblechart').append('svg').attr('width','400px').attr('height','260px');

  var numberOfCenters = lineData.values.length;
  var centerData = lineData.values;
  _.each(centerData,function(x) {
    if (x.values[0].X2013)
    {x.average = (parseFloat(x.values[0].X2008) + parseFloat(x.values[0].X2009) + parseFloat(x.values[0].X2010) + parseFloat(x.values[0].X2011) + parseFloat(x.values[0].X2012) + parseFloat(x.values[0].X2013))/6;}
    else {x.average = (parseFloat(x.values[0].X2008) + parseFloat(x.values[0].X2009) + parseFloat(x.values[0].X2010) + parseFloat(x.values[0].X2011) + parseFloat(x.values[0].X2012))/5;}
  })

  //add center name
  svgbubbles.selectAll('text.center-name').data(centerData).enter()
    .append('text')
    .attr('class','center-name')
    .attr('x',function(d,i) {
      return 400/numberOfCenters*i+200/numberOfCenters;
    })
    .attr('y',0)
    .attr('dy',15)
    .text(function(d) {return d.key;})
    .style('text-anchor','middle')
    .style('font-size','14px');
  //add center wait time
  svgbubbles.selectAll('text.center-ptime').data(centerData).enter()
    .append('text')
    .attr('class','center-ptime')
    .attr('x',function(d,i) {
      return 400/numberOfCenters*i+200/numberOfCenters;
    })
    .attr('y',20)
    .attr('dy',15)
    .text(function(d) {return Math.round(d.average)+' Days';})
    .style('text-anchor','middle')
    .style('font-size','14px');
  //add center circles
  svgbubbles.selectAll('circle.center').data(centerData).enter()
    .append('circle')
    .attr('class','center-name')
    .attr('cx',function(d,i) {
      return 400/numberOfCenters*i+200/numberOfCenters;
    })
    .attr('cy',120)
    .attr('r',function(d) {return 5*Math.sqrt(d.average);})
    .style('fill',function(d) {
      if (d.key=='California Service Center') {return 'orange';}
      else if (d.key=='Vermont Service Center') {return 'green';}
      else {return '#999999';}
    })
    .style('font-size','14px');

}// end of changeOcc();

changeYear(settings.startingYear);
changeOcc(settings.startingOcc);



  d3.select("#year-selector")
    .selectAll('div')
      .data(years)
    .enter().append('div')
      .style({'width':'50px','height':'30px','display':'inline-block','cursor':'pointer'})
      .attr('class',function(d) {return 'year '+d; })
      .text(function(d) {return d;})
      .on('click',function(d) {
        changeYear(d);
      });

})  //end of D3
