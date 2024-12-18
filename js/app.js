(function () {
  // Map options
  const options = {
    zoomSnap: 0.1,
    center: [37.8393, -84.27],
    zoom: 7,
  };

  // initialize the map
  const map = L.map("map", options);

  // Add a tile layer (the background map image) from OpenStreetMap
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }
  ).addTo(map);

  // Function to style GeoJSON feature
  function style(feature) {
    return {
      color: "#ffffff",
      fillColor: "#1D90E4",
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.5,
    };
  }

  function stateStyle(feature) {
    return {
      color: "#444444",
      fillOpacity: 0,
      weight: 3,
      opacity: 1,
    };
  }

  // temporarily define variables
  let jurisdictions;
  let kyStateBound;

  // Function to load GeoJSON data
  function loadGeoJSON(url) {
    return fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    });
  }

  // Load both GeoJSON files concurrently
  Promise.all([
    loadGeoJSON("data/ky_ss4a_award_recipients.geojson"),
    loadGeoJSON("data/ky_state.geojson"),
  ])
    .then(([jurisdictionsData, kyStateBoundData]) => {
      jurisdictions = jurisdictionsData;
      kyStateBound = kyStateBoundData;

      // Sort jurisdictions by area (largest first)
      jurisdictions.features.sort((a, b) => {
        const areaA = turf.area(a);
        const areaB = turf.area(b);
        return areaB - areaA; // Descending order
      });

      // Add sorted jurisdictions to the map with interactivity
      const jurisdictionsLayer = L.geoJSON(jurisdictions, {
        style: style,
        // onEachFeature: onEachFeature,
      }).addTo(map);

      // Add kyStateBound to the map with interactivity
      const kyStateLayer = L.geoJSON(kyStateBound, {
        style: stateStyle,
        // onEachFeature: onEachFeature,
      }).addTo(map);

      // Optional: Fit map bounds to include both layers
      const allLayers = L.featureGroup([jurisdictionsLayer, kyStateLayer]);
      map.fitBounds(allLayers.getBounds());

      jurisdictionsLayer.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties) {
          console.log(
            "Jurisdiction Feature Properties:",
            layer.feature.properties
          );
        }
      });
    })
    .catch((error) => {
      console.error("Error loading the GeoJSON data: ", error);
    });
})();
