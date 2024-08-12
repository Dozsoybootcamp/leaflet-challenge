// URL to fetch the earthquake data for the past month
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
fetch(queryUrl)
  .then(response => response.json())
  .then(data => {
    // Send the data to the createFeatures function
    createFeatures(data.features);
  });


  function createFeatures(earthquakeData) {
    // Define a function that will run once for each feature in the features array.
    // Give each feature a popup describing the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>
                       <p>Magnitude: ${feature.properties.mag}</p>
                       <p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: function(feature, latlng) {
        const mag = feature.properties.mag;
        const depth = feature.geometry.coordinates[2];
        return L.circleMarker(latlng, {
          radius: mag * 3, // Adjust radius based on magnitude
          fillColor: getColor(depth), // Color based on depth
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      }
    });
  
    // Send the earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  function createMap(earthquakes) {
    // Create the base map layer
    const streetmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap contributors"
    });
  
    // Create a baseMaps object to hold the base layer
    const baseMaps = {
      "Street Map": streetmap
    };
  
    // Create an overlayMaps object to hold the earthquake layer
    const overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create the map object with options
    const map = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });
  
    // Create a layer control and pass in the baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);
  
    // Add a legend to the map
    const legend = L.control({ position: "bottomright" });
  
    legend.onAdd = function() {
      const div = L.DomUtil.create("div", "info legend");
      const depths = [-10, 10, 30, 50, 70, 90];
      const labels = [];
  
      for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
      }
  
      return div;
    };
  
    legend.addTo(map);
  }
  function getColor(depth) {
    return depth > 90 ? '#800026' :
           depth > 70 ? '#BD0026' :
           depth > 50 ? '#E31A1C' :
           depth > 30 ? '#FC4E2A' :
           depth > 10 ? '#FD8D3C' :
                        '#FFEDA0';
  }
      