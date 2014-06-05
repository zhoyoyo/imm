$(function() {

  $('#barchart').css({'max-height': $(window).height()-120 + 'px'});
  $('#about').css({'height':$(window).height()-120+'px'});
  var winW = $(window).width();
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
    startingOcc: "Accountants, Auditors and Related Jobs"
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

///Draw bar graph
  var svgbars = d3.select('#barchart').append('svg').attr('width','100%').attr('height','5450px');
  var maxWidth = winW*36/100-40;


  var changeYear = function(thisyear) {
    settings.startingYear = thisyear;
    d3.select('.year-bar').text(thisyear);
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
      .attr('width',function(d) {
        var w = d['a'+thisyear]*1.53;
        return w > maxWidth ? (maxWidth +'px') : (w +'px');
      });

    bars
      .enter().append('rect')
      .attr('class',function(d) {return 'bars '+d.keyAbb})
      .attr('x',0)
      .attr('y',function(d,i) {return 30+i*50;})
      .attr('height','28px')
      .attr('width',function(d) {
        var w = d['a'+thisyear]*1.53;
        return w > maxWidth ? (maxWidth +'px') : (w +'px');
      })
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
        changeDisplay(settings.startingYear,d.key);
        //change the dropdown display
//        d3.select('select').node().value = d.key;
        $('.custom-combobox-input').val(d.key);
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
          var w = d['a'+thisyear]*1.53;
          if (w>maxWidth) {return (maxWidth-3) + 'px';}
          else if (d['a'+thisyear]>13) {return (w-3)+'px';}
          else {return (w+3) +'px';}
      })
      .attr('y',function(d,i) {return 20+i*50})
      .attr('text-anchor',function(d){
        return d['a'+thisyear]>13? 'end':'start'
      })
      .style('fill-opacity',1)
      .text(function(d) {return Math.round(d['a'+thisyear]);});
    //enter
    barValue
      .enter().append('text')
      .attr('class',function(d) {return 'value '+d.keyAbb})
      .attr('pointer-events','none')
      .attr('cursor','pointer')
      .attr('x',function(d) {
        var w = d['a'+thisyear]*1.53;
        if (w>maxWidth) {return (maxWidth-3) + 'px';}
        else if (d['a'+thisyear]>13) {return (w-3)+'px';}
        else {return (w+3) +'px';}
      })
      .attr('y',function(d,i) {return 20+i*50})
      .attr('text-anchor',function(d){
        return d['a'+thisyear]>13? 'end':'start'
      })
      .attr('dy',30)
      .style('font-size','13px')
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
      .style('font-size','13px')
      .style('fill-opacity',1)
      .style('fill','#414042')
      .text(function(d) {return d.key;});
    //exit
    barLabel
      .exit()
      .transition().duration(1000)
      .style('fill-opacity',0)
      .remove();

  }//end of changeYear()


  /// DRAW LINE CHART
  var svglines = d3.select('#linechart').append('svg').attr('width','350px').attr('height','240px');
  //add occupation name on the title
  var textsnap = d3.select('#theocc').append('svg').attr('width','450px').attr('height','25px')
    .append('text')
    .attr('class','theocc')
    .style('fill','#414042')
    .attr('x',0)
    .attr('y',15);

var textsnap2 = d3.selectAll('#theocc2').append('svg').attr('width','450px').attr('height','25px')
  .append('text')
  .attr('class','theocc')
  .style('fill','#414042')
  .attr('x',0)
  .attr('y',15);



  //draw line
  var w=320,h=220,margin=20;
  var x = d3.time.scale().domain([2008,2013]).range([0+margin,w-margin]);
  var y = d3.scale.linear().range([h,margin*2]);
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
    .append('text')
    .attr('y',20)
    .style('fill','#999999')
    .style('font-weight',700)
    .style('font-size','13px')
    .text('Time (Days)');
  var Line = svglines.append('path')
    .attr('class','line');

  //DRAW BUBBLE CHART
  var svgbubbles = d3.select('#bubblechart').append('svg').attr('width','340px').attr('height','260px');



  var changeOcc = function(thisocc) {
    settings.startingOcc = thisocc;
    var lineData = _.where(dataOriginal,{ key:thisocc })[0];
        lineData.year = years;
        lineData.wait = [lineData.a2008,lineData.a2009,lineData.a2010,lineData.a2011,lineData.a2012,lineData.a2013];

//    d3.selectAll('.bars').style('fill','#cccccc');
//    d3.select('.bars.'+lineData.keyAbb).style('fill','#F79151').attr('class','.bars.selected'+lineData.keyAbb);

    //update occupation name on the title
    textsnap.text(lineData.key);
    textsnap2.text(lineData.key);

    //update y axis
    y.domain([0,d3.max(lineData.wait)]);
    yAxis.scale(y).tickValues([0,parseFloat(d3.max(lineData.wait)/2).toFixed(0),parseFloat(d3.max(lineData.wait)).toFixed(0)]);
    svglines.select('.y.axis').transition().duration(500).call(yAxis);

    //update line
    svglines.select('path.line')
      .datum(lineData.wait)
      .transition().duration(500)
      .attr('d',line);

    //add dots
    var lineDots = svglines.selectAll('circle.dots')
      .data(lineData.wait);
    lineDots.transition().duration(500)
      .attr('cy',function(d,i) {return y(d);});
    lineDots
      .enter()
      .append('circle')
      .attr('class','dots')
      .attr('r',3.5)
      .attr('cx',function(d,i) {return x(years[i]);})
      .attr('cy',function(d,i) {return y(d);})
      .attr('fill','#F79151');
    lineDots
      .exit()
      .transition().duration(500)
      .remove();

    //add dot-text
    var lineValue = svglines.selectAll('text.text-dots')
      .data(lineData.wait);
    lineValue.transition().duration(500)
      .attr('y',function(d,i) {return y(d)-5;})
      .text(function(d) {return Math.round(d);});
    lineValue
      .enter()
      .append('text')
      .attr('class','text-dots')
      .attr('x',function(d,i) {return x(years[i]);})
      .attr('y',function(d,i) {return y(d)-5;})
      .text(function(d) {return Math.round(d);})
      .style('font-size','12px')
      .style('opacity',1)
      .style('text-anchor','middle');
    lineValue
      .exit()
      .transition().duration(500)
      .style('opacity',0)
      .remove();


    ///##### DRAW BUBBLE CHART

    var numberOfCenters = lineData.values.length;
    var centerData = lineData.values;
    _.each(centerData,function(x) {
      if (x.values[0].X2013)
      {x.average = (parseFloat(x.values[0].X2008) + parseFloat(x.values[0].X2009) + parseFloat(x.values[0].X2010) + parseFloat(x.values[0].X2011) + parseFloat(x.values[0].X2012) + parseFloat(x.values[0].X2013))/6;}
      else {x.average = (parseFloat(x.values[0].X2008) + parseFloat(x.values[0].X2009) + parseFloat(x.values[0].X2010) + parseFloat(x.values[0].X2011) + parseFloat(x.values[0].X2012))/5;}
    })

    //add center name
    var centerName =
    svgbubbles.selectAll('text.center-name').data(centerData);
    centerName
      .transition().duration(750)
      .attr('x',function(d,i) {
        return 340/numberOfCenters*i+180/numberOfCenters;
      })
      .text(function(d) {return d.key;});
    centerName
      .enter()
      .append('text')
      .attr('class','center-name')
      .attr('x',function(d,i) {
        return 340/numberOfCenters*i+180/numberOfCenters;
      })
      .attr('y',20)
      .text(function(d) {return d.key;})
      .style('text-anchor','middle')
      .style('fill','#999')
      .style('font-weight','700')
      .style('font-size','12px')
      .style('fill-opacity',1);
    centerName
      .exit()
      .transition().duration(500)
      .style('fill-opacity',0)
      .remove();


    //add center wait time
    var waitTime = svgbubbles.selectAll('text.center-ptime').data(centerData);
    waitTime
      .transition().duration(750)
      .attr('x',function(d,i) {
        return 340/numberOfCenters*i+180/numberOfCenters;
      })
      .text(function(d) {return Math.round(d.average)+' Days';});
    waitTime
      .enter()
      .append('text')
      .attr('class','center-ptime')
      .attr('x',function(d,i) {
        return 340/numberOfCenters*i+180/numberOfCenters;
      })
      .attr('y',40)
      .text(function(d) {return Math.round(d.average)+' Days';})
      .style('text-anchor','middle')
      .style('fill','#414042')
      .style('font-size','13px')
      .style('fill-opacity',1);
    waitTime
      .exit()
      .transition().duration(500)
      .style('fill-opacity',0)
      .remove();

    //add center circles
    var bubbles = svgbubbles.selectAll('circle.center').data(centerData);
    bubbles
      .transition().duration(750)
      .attr('cx',function(d,i) {
        return 340/numberOfCenters*i+180/numberOfCenters;
      })
      .attr('r',function(d) {
        if (numberOfCenters == 2) {return Math.sqrt(d.average)*4;}
        else if (numberOfCenters == 3) {return Math.sqrt(d.average)*4;}
        else {return 3*Math.sqrt(d.average);}
      })
      .style('fill',function(d) {
        if (d.key=='California S.C.') {return '#F79151';}
        else if (d.key=='Vermont S.C.') {return 'green';}
        else if (d.key=='Nebraska S.C.') {return 'steelblue';}
        else {return '#999999';}
      });
    bubbles
      .enter()
      .append('circle')
      .attr('class','center')
      .attr('cx',function(d,i) {
        return 340/numberOfCenters*i+180/numberOfCenters;
      })
      .attr('cy',100)
      .attr('r',function(d) {
        if (numberOfCenters == 2) {return Math.sqrt(d.average)*4;}
        else if (numberOfCenters == 3) {return Math.sqrt(d.average)*4;}
        else {return 3*Math.sqrt(d.average);}
      })
      .style('fill',function(d) {
        if (d.key=='California S.C.') {return '#F79151';}
        else if (d.key=='Vermont S.C.') {return 'green';}
        else if (d.key=='Nebraska S.C.') {return 'steelblue';}
        else {return '#999999';}
      })
      .style('fill-opacity',1);

    bubbles
      .exit()
      .transition().duration(500)
      .attr('r',0)
      .style('fill-opacity',0)
      .remove();

  }// end of changeOcc();


  //Add Display Text
  d3.select('#big-display')
    .append('div').attr('class','ptime')
    .style('display','block')
    .text('sometext');

  var changeDisplay = function(year,occ) {
    var pData = _.where(dataOriginal,{ key:occ })[0];
    var text = pData['a'+year];
    d3.select('div.ptime').text(text+' Days');
  }


  //fill dropdown menu
  d3.select('#occ-selector')
    .append('select')
    .attr('class','select-menu')
    .selectAll('option')
    .data(dataOriginal)
    .enter()
    .append('option')
    .text(function(d) {return d.key;});

  d3.select('select').on('change',function() {
    var number=this.selectedIndex;

    var dataOrdered = dataOriginal
      .sort(function(a,b) {
        return d3.ascending(a.key,b.key);
      });

    changeOcc(dataOrdered[number].key);
    changeDisplay(settings.startingYear,dataOrdered[number].key);

  })



  d3.select("#year-selector").select('.years')
    .selectAll('div')
    .data(years)
    .enter().append('div')
    .style({'width':'50px','height':'20px','display':'inline-block','cursor':'pointer'})
    .attr('class',function(d) {return 'year '+d; })
    .text(function(d) {return d;})
    .style('font-size','13px')
    .style('color','#414042')
    .style('background',function(d) {
      return d == 2013? '#999' : "#F7F5F4";
    })
    .style('color',function(d) {
      return d==2013? 'white' : '#414042';
    })
    .on('click',function(d) {
      d3.selectAll('.year').style('background','#F7F5F4');
      d3.selectAll('.year').style('color','#414042');
      d3.select(this).style('background','#999');
      d3.select(this).style('color','white');
      changeYear(d);
      changeDisplay(d,settings.startingOcc);
    });

  //intial graphics
  changeYear(settings.startingYear);
  changeOcc(settings.startingOcc);
  changeDisplay(settings.startingYear,settings.startingOcc);

  function initCombobox() {
      // Setup combobox to replace select
      $('select.select-menu').combobox({
          onSelect: onchange,
          select: function (event, ui) {
              // Trying to suppress Enter button triggering submission
              event.preventDefault();
              event.stopPropagation();
              return false;
          }
      });

      // When you focus on the input, select everything
      $('.custom-combobox-input').on('focus', function () {
          $(this).select();
      })
  }


  // result of selecting an occupation from dropdown
  var onchange = function() {
    var number=d3.select('select').node().selectedIndex;
    var dataOrdered = dataOriginal
      .sort(function(a,b) {
        return d3.ascending(a.key,b.key);
      });

    changeOcc(dataOrdered[number].key);
    changeDisplay(settings.startingYear,dataOrdered[number].key);

  }



  initCombobox();

})  //end of D3


}) //end of jquery
