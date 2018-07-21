const getByState = (incomeData) => {
  return incomeData.reduce((obj, item) => {
    obj[item.State] = obj[item.State] || []
    obj[item.State].push(item)
    return obj;
  }, {})

}

const getMedByState = (byState) => {
  const medByState = {} 
  Object.keys(byState).forEach((key) => {
    medByState[key] = byState[key]
      .map(item => Number(item.MEDHHINC15))
      .reduce((a, b) => a + b, 0) / byState[key].length
  })
  return medByState
}

const getPovByState = (byState) => {
  var povByState = {}
  Object.keys(byState).forEach((key) => {
    povByState[key] = byState[key]
    .map(item => Number(item.CHILDPOVRATE15))
    .reduce((a,b)=>a+b,0)/ byState[key].length
  })
  //console.log({povByState})
  return povByState
}

d3.csv("./Socioeconomic.csv", function(error, incomeData) {
  if (error) return console.warn(error);

  d3.csv("./childhood_obesity_by_state.csv", function(error2, obesityData) {
    if (error2) return console.warn(error2);
    
    //console.log(incomeData);
    //console.log(obesityData);

    // Data preparation

    // income data
    const byState = getByState(incomeData)
    // console.log({byState})
    const medByState = getMedByState(byState)
    // console.log({medByState})
    const povByState = getPovByState(byState)
    // console.log({povByState})
    
    const states = Object.keys(povByState);

    const incomes = states.map(function(state) {
        return medByState[state]
    });
    console.log(incomes)
    
    const poverties = states.map(function(state) {
      return povByState[state]
    });
    //console.log(poverties)

    // console.log('overweightObese', overweightObese)

    
    var scale = d3.scaleLinear()
      .domain([d3.min(poverties), d3.max(poverties)])
      .range([2, 30]);
    const radius = poverties.map(function(a) {
      return scale(a)
    })
    
    
    const ctx = document.getElementById('scatter-chart');

    new Chart(ctx, {
      type: 'scatter',  
      data: {
          datasets: [{
            label: 'States',
            //xAxisID: 'Median Income Level',
            //yAxisID: 'Obesity Rate',
            backgroundColor: 'rgba(50,229,173,1',
            pointRadius: poverties,
            pointHoverRadius: poverties,
            pointBackgroundColor: 'rgba(50,229,173,0.8',
            pointBorderColor: 'black',
            data: obesityData.map(o => {
              return Number(o.Overweight_or_obese)
            })
          }],
          labels: incomes
      },
  
      options: {
        options: true,
        title: {
          display: true,
          text: 'Childhood Obesity in the United States'
        },
        scales: {
                xAxes: [{
                  type: 'category',
                  position: 'bottom',
                  offset: true,
                  gridLines: false,
                  scaleLabel: {
                    display: true,
                    labelString: 'Median Household Income'
                  }
                }],
                yAxes: [{
                  ticks: {
                    min: 15,
                    max: 40
                  },
                  scaleLabel: {
                    display: true,
                    labelString: 'Childhood Obesity Rate'
                  },
                  offset: true
                }]    
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem) => {
              //console.log(tooltipItem, data)
              return obesityData[tooltipItem.index].State              
            }
          }
        }
      }
  });

  })


});