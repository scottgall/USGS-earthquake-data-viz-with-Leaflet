// Overview
// Below is a very common format for Leaflet
//
// I like to define all the functions at the top of my scripts because I can view what the functions does before
// reading the code.  When putting a function at the top of the page, you may need to be carefull about the order
// of the functions.  Most of the time you can have functions anywhere - at the bottom, top or in the middle of
// the code.  One exception is if a user defined function is also used inside a user defined function then the function
// loading might be affected.  

// Javascipt Order Article:  https://www.jsdiaries.com/does-javascript-function-order-matter/



// Store our API endpoint inside queryUrl

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function popUpMsg(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
}

 // Define streetmap and darkmap layers
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "streets-v11",
  accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  maxZoom: 18,
  id: "satellite-v9",
  accessToken: API_KEY
});

// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap,
  "Satellite map": satellitemap
};
  
// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
  center: [ 37.09, -95.71 ],
  zoom: 5,
  layers: [streetmap]     //default selected layer
});
// if more than one layer to L is listed the one that shows up 
// is the one defined last above myMap declaration

// Add streetmap tile to map; if only one tile defined then this is a good way of doing this.
// If only one tile layer then the following will be used "L.control.layers(null, overlayMaps, " later in the code
streetmap.addTo(myMap);
// if multiple tiles are being used then the above code is not needed.  The multiple tiles will be added
// when "L.control.layers(baseMaps, overlayMaps, " 


// create layer; will attach data later on
var earthquakes = new L.LayerGroup();
// Alternate method and same as above
// var earthquakes = L.layerGroup();

var faultlines = new L.LayerGroup();

// Create overlay object to hold our overlay layer
var overlayMaps = {
  Earthquakes: earthquakes,
  "Fault Lines": faultlines
};

// Create a layer control
// Pass in our baseMaps and overlayMaps
// All layers are added through these lines of code
// if only one tile layer is being used then the basemaps tile group can be 
// replaced with null.  This will prevent a tile button from showing in the
// upper right corner of the screen
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  L.geoJSON(data, {
    onEachFeature: popUpMsg,
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
        radius: circleRadius(feature.properties.mag),
        color: depthColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.75
      });
    }
  }).addTo(earthquakes);

  // Here are some additional examples:  https://geospatialresponse.wordpress.com/2015/07/26/leaflet-geojson-pointtolayer/ 

  earthquakes.addTo(myMap);
});

var url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(url, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  L.geoJSON(data, {
    style: function() {
      return {
        color: "red",
        weight: "1.5",
        opacity: 0.8
      }
    }
  }).addTo(faultlines);

  // Here are some additional examples:  https://geospatialresponse.wordpress.com/2015/07/26/leaflet-geojson-pointtolayer/ 

  faultlines.addTo(myMap);
});

var legend = L.control({position: "bottomright"});

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend"),
            grades = [0, 5, 10],
            labels = [];
  div.innerHTML += '<h3 class="depthTitle">Depth</h3>'
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + depthColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'); 
  }

  return div;
}

legend.addTo(myMap);

function circleRadius(mag) {
  return mag * 10;
}

function depthColor(depth) {
  var color = "yellow";
  if (depth > 10) {
    color = "red";
} else if (depth > 5) {
    color = "orange";
  }
  return color;
}


// Another good example is Day 3 Citibike; I slacked out a linear version of the code that does not include all the functions.
// Just like onEachFeature, there are other options that can be included, see the documentation
// https://leafletjs.com/reference-1.7.1.html#geojson-option 
// https://leafletjs.com/examples/geojson/

// Here is a common structure

// Step 1: Define Tile Layers
// Step 2.  Define Basemaps
// Step 3:  Define Leaflet map with default layers included 
// Step 4:  If there is only one tile then Add one tile with Addto(map); in L.control use null as first parameter
// Step 5:  Create a layer for each dataset that can be used as an overlay in the controls
// Step 5.  Add Overlays
// Step 6.  Add controls to L; Use null for first term if only one tile (see Step4 and this example)
//Step 7.  Load GeoJson via d3.json so that the file is loaded
	// Step 8.  Add data to map via geojson
	// Step 8a.  May include these options.. see https://leafletjs.com/reference-1.7.1.html#geojson-option
  //    pointToLayer - change from default marker - see pointToLayer example here https://leafletjs.com/examples/geojson/ especially geojsonMarkerOptions definition; this variable could also be set to the style:; look up examples via google
  //    style  - example of use in Day 2 Activity 1; but styles the marker/feature; look up examples in conjunction with pointToLayer
  //    onEachFeature - many examples mostly of popups; action that occurs when marker is clicked on the map
  //    filter - not used in activites or in the homework
// Step 8b.  addTo(layer***)     Note:  not map; choose a layer group
// Step 9.  Add layergroup to map with addTo(map)

// Pulling info from Day 3 Activity 1 Advanced

// Step 10.  Create legend
// Step 11.  Use onAdd to include legend + DomUtil.create
// Step 12.  Add legend to map with .addTo(map)

// IF there are more data to be added and it is unrelated to first data set then steps 7-9 can be mimicked.
// Always check the data to see what type of json data it is.  L.geoJson() will map whatever geometries found in a
// json or geojson file.  If it is a geometry.type of polygon then it will be an enclosed shape; if it is a Linestring then it will be multiple lines connected, etc.

