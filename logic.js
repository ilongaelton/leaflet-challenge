// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});


// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
});

// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [37.7749, -122.4194], // Example: San Francisco coordinates
  zoom: 5,
  layers: [basemap] // Set the default layer
});


// Then add the 'basemap' tile layer to the map.

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
let baseMaps = {
  "Basemap": basemap,
  "Street": street
};

// Define an overlays object to hold the earthquake and tectonic plates layers.
let overlays = {
  "Earthquakes": null, // Placeholder for the earthquake layer
  "Tectonic Plates": null // Placeholder for the tectonic plates layer
};

// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]), // Depth determines color
      color: "#000000", // Black border
      radius: getRadius(feature.properties.mag), // Magnitude determines radius
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 90) return "#ea2c2c"; // Red for deep earthquakes
    if (depth > 70) return "#ea822c"; // Orange
    if (depth > 50) return "#ee9c00"; // Yellow-orange
    if (depth > 30) return "#eecc00"; // Yellow
    if (depth > 10) return "#d4ee00"; // Light green
    return "#98ee00"; // Green for shallow earthquakes
  }
  
  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) return 1; // Small radius for zero magnitude
    return magnitude * 4; // Scale radius by magnitude
  }
  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng); // Create a circle marker for each feature
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<h3>Magnitude: ${feature.properties.mag}</h3>
         <hr>
         <p>Location: ${feature.properties.place}</p>`
      );
    }
  }).addTo(map);
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(map);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    const depthIntervals = [-10, 10, 30, 50, 70, 90];
    const colors = [
      "#98ee00", // Green for shallow earthquakes
      "#d4ee00", // Light green
      "#eecc00", // Yellow
      "#ee9c00", // Yellow-orange
      "#ea822c", // Orange
      "#ea2c2c"  // Red for deep earthquakes
    ];
  

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depthIntervals.length; i++) {
      div.innerHTML +=
        `<i style="background: ${colors[i]}"></i> ` +
        `${depthIntervals[i]}${depthIntervals[i + 1] ? "&ndash;" + depthIntervals[i + 1] : "+"}<br>`;
    }
  
    return div;
  };
  

   
  // Finally, add the legend to the map.
  legend.addTo(map);

 // OPTIONAL: Step 2
// Make a request to get our Tectonic Plate geoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
  // Create a GeoJSON layer for tectonic plates and style it.
  let tectonicPlates = L.geoJson(plate_data, {
    style: {
      color: "#ff6500", // Orange color for tectonic plate boundaries
      weight: 2 // Line thickness
    }
  });

  // Add the tectonic plates layer to the map.
  tectonicPlates.addTo(map);

  // OPTIONAL: Add the tectonic plates layer to the layer control for toggling.
  let overlays = {
    "Tectonic Plates": tectonicPlates
  };
  L.control.layers(baseMaps, overlays).addTo(map);
});
