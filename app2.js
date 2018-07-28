d3.csv("./Socioeconomic.csv", function(error, incomeData) {
    if (error) return console.warn(error);

    //scaling radius
    var range = [0, 100] // range in pixels for bubble radius, min/max
    var domain = [0, 60]
    /**
      * scaleRadius - scale for bubble chart because chart js doesn't calculate radius, must set in pixels...
      *
      * @param {Object}
      * @returns {Number} scaled radius value r to correspond to child poverty rate
      */
    function scaleRadius(value) {
       var scaleLog = d3.scaleLog()
           .domain(domain)
           .range(range)
      return scaleLog(value);
    }

    var data = incomeData.map(function(income){
      return {
        x : parseFloat(income.MEDHHINC15),
        r : parseInt(income.CHILDPOVRATE15),
        label : income.State
      }
    });
    console.log(data);


    d3.csv("./childhood_obesity_by_state.csv", function(error, obesityData) {
      if (error) return console.warn(error);


      obesityData.forEach(function(item){
        item.x = 0;
        item.r = 0;
        item.y = parseFloat(item["Overweight_or_obese"]);
        item.length = 0;
        data.forEach(function(value){
          if(item.Abbr === value.label){
            if(value.x)
              item.x += value.x;
            if(value.r)
              item.r += value.r;
            item.length += 1;

          }
        });
      });

      obesityData.forEach(function(item){
        item.x = item.x/item.length;
        item.r = parseInt(item.r/item.length);
      });
      //adding overwieght as y-axis      
      console.log(obesityData);


      var scatterChart = new Chart(document.getElementById("scatter-chart"), {
        type: 'scatter',
        type: 'bubble',
        data: {
          datasets: [{
            label: 'Childhood Obesity in the United States',
            backgroundColor: 'rgba(50,229,173,1',
            pointBackgroundColor: 'rgba(50,229,173,0.8',
            pointBorderColor: 'black',
            data: obesityData
          }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    offset: true,
                    gridLines: false,
                    scaleLabel: {
                      display: true,
                      labelString: 'Median Household Income'
                    }
                }],
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Childhood Obesity Rate'
                  }
                }]
            },
            tooltips: {
              callbacks: {
                label: (tooltipItem) => {
                  return obesityData[tooltipItem.index].State
                }
              }
            }
        }
    });
  });

});
