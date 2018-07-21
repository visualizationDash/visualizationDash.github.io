// Creating map object
var myMap = L.map("map", {
  center: [37.6872, -97.3301],
   zoom:7
  //  ,
  // layers: [light]
});

var controlLayers = L.control.layers().addTo(myMap)
// Adding tile layer
var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
}).addTo(myMap);

function mrfei_color(mrfei){
  
  return mrfei > 90 ? '#fff7f3' :
      mrfei > 80 ? '#fde0dd' :
      mrfei > 60 ? '#fcc5c0' :
      mrfei > 40 ? '#fa9fb5' :
      mrfei > 30 ? '#f768a1' :
      mrfei > 20 ? '#dd3497' :
      mrfei > 10 ? '#ae017e' :
                   '#7a0177';
}

var geoJsonCensus, geoJsonMrfei, geoJsonMcD,geoJsonCounty;

// 1)update base map with county layout
var censustract_path ='ks_censustracks.geojson';
Plotly.d3.json(censustract_path, function(data) {
  // console.log(data)
  geoJsonCensus = L.geoJson(data, {
    // Style for each feature (in this case a census tract)
    style: function(feature) {
      return {
        color: "white",
        fillColor: "#7a0177",
        fillOpacity: 0.5,
        weight: 1.5};
      },
      onEachFeature: function(feature, layer) {
        // Setting various mouse events to change style when different events occur
        layer.on({
          // On mouse over, make the feature (census tract) more visible
          mouseover: function(event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.9
            });
          },
          // Set the features style back to the way it was
          mouseout: function(event) {
            geoJsonCensus.resetStyle(event.target);
          },
          // When a feature (census tract) is clicked, fit that feature to the screen
          click: function(event) {
            map.fitBounds(event.target.getBounds());
          }
        });
        // Giving each feature a pop-up with information about that specific feature
        layer.bindPopup("<h1>" + feature.properties.GEOID + "</h1> <hr>");
      }
    }
  )
  controlLayers.addOverlay(geoJsonCensus, 'Census Tract')
});

// 2) Grab mrfei data with d3... and add color depending on mrfei value
var mrfei_path ='mrfei_ks.geojson';
Plotly.d3.json(mrfei_path, function(data) { 
  geoJsonMrfei = L.geoJson(data, {   
     pointToLayer: function(feature, location){
        return new L.CircleMarker(location,  {
                      radius: 8,
                       fillColor:mrfei_color(feature.properties.mrfei) ,
                      color: "#000",
                      weight: 0.5,
                      opacity: 1,
                      fillOpacity: 0.8});
     },
     // Called on each feature
    onEachFeature: function(feature, layer) {
      // Giving each feature a pop-up with information about that specific feature
      layer.bindPopup("<h4>Mrfei: " + feature.properties.mrfei + "</h4> <hr> <h5> Square Miles: "+ feature.properties.ALAND_SQMI + "</h5>");
    }    
})
// // Setting up the legend
var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>MRFEI</strong>'],
    categories = ['< 10','10-20','21-30','31-40','41-60', '61-80','81-90','90+'];

    for (var i = 0; i < categories.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + mrfei_color(categories[i]) + '"></i> ' +
            (categories[i] ? categories[i]: '+'));
           
        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
     legend.addTo(myMap);
// }

// Adding legend to the map
//  legend.addTo(myMap);
controlLayers.addOverlay(geoJsonMrfei, 'MRFREI')
});




// 3) mcdonald layer 
var mcdonald_layer = 'kc_mcd.geojson';
Plotly.d3.json(mcdonald_layer, function(data) {  
 geoJsonMcD = L.geoJson(data, {   
    pointToLayer: function(feature, location){
       return new L.CircleMarker(location,  {
                     radius: 8,
                      fillColor:"red" ,
                     color: "#000",
                     weight: 0.5,
                     opacity: 1,
                     fillOpacity: 0.8});
    },
    // Called on each feature
   onEachFeature: function(feature, layer) {
    layer.bindPopup("<h4>City: " + feature.properties.city + "</h4> <hr> <h5> Zip: "+ feature.properties.zip + "</h5>");
  }

 })
 controlLayers.addOverlay(geoJsonMcD, 'McDonald')
});

// 4) county layer figure if you can filter KS counties
var county_layer = 'cb_2017_us_county_20m.geojson';
 Plotly.d3.json(county_layer, function(data) {     
    geoJsonCounty = L.geoJson(data, {
      //return KS only
      filter: function(feature, layer){
        if (feature.properties.STATEFP ==="20") return true;
      },
      // Style for each feature (in this case a census tract)
      style: function(feature) {
        return {
          color: "black",
          fillColor: "purple",
          fillOpacity: 0.1,
          weight: 1.5};
        },
        onEachFeature: function(feature, layer) {
          layer.bindPopup("<h5>" + feature.properties.NAME + "</h5> <hr> <h5>" +feature.properties.ALAND +"</h5");
        }
      }
    )
    controlLayers.addOverlay(geoJsonCounty, 'Country Boundaries')
  });

