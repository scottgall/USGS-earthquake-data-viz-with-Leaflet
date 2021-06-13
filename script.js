function popUpMsg(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
}

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

var baseMaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap,
  "Satellite map": satellitemap
};
  
var myMap = L.map("map", {
  center: [ 0, 0 ],
  zoom: 2,
  layers: [streetmap]
});

streetmap.addTo(myMap);

var earthquakes = new L.LayerGroup();

var faultlines = new L.LayerGroup();

var overlayMaps = {
  Earthquakes: earthquakes,
  "Fault Lines": faultlines
};

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

d3.json(queryUrl, function(data) {
  L.geoJSON(data, {
    onEachFeature: popUpMsg,
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
        radius: circleRadius(feature.properties.mag),
        fillColor: depthColor(feature.geometry.coordinates[2]),
        fillOpacity: 1,
        color: "black",
        weight: .5,
      });
    }
  }).addTo(earthquakes);

  earthquakes.addTo(myMap);
});

var url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(url, function(data) {
  L.geoJSON(data, {
    style: function() {
      return {
        color: "orange",
        weight: "1.5",
        opacity: 0.8
      }
    }
  }).addTo(faultlines);

  faultlines.addTo(myMap);
});

var legend = L.control({position: "bottomright"});

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend"),
      grades = [-10, 10, 30, 50, 70, 90]
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
  return mag * 2;
}

function depthColor(depth) {
  depth > 90 ? color = "hsl(357,98%,68%)":
  depth > 70 ? color = "hsl(26,95%,67%)":
  depth > 50 ? color = "hsl(40,98%,58%)":
  depth > 30 ? color = "hsl(52,92%,51%)":
  depth > 10 ? color = "hsl(65,96%,48%)":
               color = "hsl(80,100%,48%)";
  return color;
}