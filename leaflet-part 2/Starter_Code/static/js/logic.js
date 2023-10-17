//creating the map project
let myMap = L.map('map').setView([37.0902, -95.7129],3);

let earthquakes = L.layerGroup();

const platesUrl= "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
// fetch data and add it to the map as separate layer
let plates = L.layerGroup();
d3.json(platesUrl).then(function(plateData){
    L.geoJSON(plateData,{
        color:"orange",
    }).addTo(plates);
    plates.addTo(myMap);
});

// add  base map

let grey = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});
let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

let outdoor = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}', {
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

const baseMaps = {
    "grayscale":grey,
    "satellite":satellite,
    "outdoor": outdoor
};
    

//set our api urls based on what we want to display.
const url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


//call the api with d3 to get the data.
d3.json(url).then(function(data){
  //create a leaflet layer group
  let earthquakes = L.layerGroup();
  
  //loop through the features in the data
  data.features.forEach(function(feature) {
    //get the coordinates of the earthquake
    let coordinates = feature.geometry.coordinates;
    let lat = coordinates[1];
    let lng = coordinates[0];
    let depth = coordinates[2];
    
    //get the magnitude of the earthquake
    let magnitude = feature.properties.mag;
    
    //create a circle marker for the earthquake
    let marker = L.circleMarker([lat, lng], {
      radius: magnitude * 3,
      color: '#000',
      weight: 1,
      fillColor: getColor(depth),
      fillOpacity: 0.7
    });
    
    //add a popup to the marker with information about the earthquake
    marker.bindPopup(`<strong>Location:</strong> ${feature.properties.place}<br>
      <strong>Magnitude:</strong> ${magnitude}<br>
      <strong>Depth:</strong> ${depth} km`);
    
    //add the marker to the layer group
    marker.addTo(earthquakes);
  });
  
  //add the layer group to the map
  earthquakes.addTo(myMap);

  //define a function to get the color based on the depth of the earthquake
function getColor(d) {
  return d > 90 ? '#810f7c' :
         d > 70 ? '#8c96c6' :
         d > 50 ? '#fc4e2a' :
         d > 30 ? '#3690c0' :
         d > 10 ? '#ffeda0' :
         d > -10 ? '#006d2c' :
         '#006837';
}

//create a legend control
let legend = L.control({position: 'bottomright'});
//add the legend to the map
legend.onAdd = function () {
  let div = L.DomUtil.create('div', 'info legend'),
      depths = [-10, 10, 30, 50, 70, 90],
      labels = [];

  // loop through our depth intervals and generate a label with a colored square for each interval
  for (let i = 0; i < depths.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+') + '<br>';
  }

  return div;
};

legend.addTo(myMap);

});
const overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": plates
  };
  
  // Add Layer controls
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
  
