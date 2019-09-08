// 1. set up links to the urls
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var url_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"



d3.json(url, function (data) {
    // once we get data, send data.features object to the createfeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // define an onEach Function to create pop ups
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + Math.round(feature.properties.mag * 100) / 100 +
            " Magnitude Earthquake</h3><hr><p>" + feature.properties.place +
            "</p><p>" + new Date(feature.properties.time) + "</p>")
    }

    function markerSize(data) {
        return data * 15000;
    };

    function chooseColor(magnitude) {
        if (magnitude >= 5) {
            return "red"
        }
        else if (magnitude >= 4) {
            return "orange";
        }
        else if (magnitude >= 3) {
            return "gold";
        }
        else if (magnitude >= 2) {
            return "yellow";
        }
        else if (magnitude >= 1) {
            return "greenyellow";
        }
        else {
            return "lime";
        }
    }

    // create a geoJson layer
    var earthquakes = L.geoJson(earthquakeData, {
        pointToLayer: function (earthquakeData, layer) {
            return L.circle(layer, {
                radius: markerSize(earthquakeData.properties.mag),
                color: chooseColor(earthquakeData.properties.mag),
                fillOpacity: 1

            });
        },
        onEachFeature: onEachFeature
    });

    // sending earthquakes layer to the createMap function
    createMap(earthquakes)
};

function createMap(earthquakes) {
    // Adding tile layer
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // create a baseMaps object
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    // Create the faultline layer
    var faultLine = new L.LayerGroup();

    var overlayMaps = {
        EarthQuakes: earthquakes,
        Faultlines: faultLine
    }

    var myMap = L.map("map", {
        center: [39.83, -98.58],
        zoom: 4,
        layers: [satellite, faultLine]
    })

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    d3.json(url_plates, function (data) {
        L.geoJson(data, {
            style: function () {
                return { color: "orange", fillOpacity: 0 }
            }
        }).addTo(faultLine)
    })

    function getColor(d) {
        return d > 5 ? 'red' :
            d > 4 ? 'orange' :
                d > 3 ? 'gold' :
                    d > 2 ? 'yellow' :
                        d > 1 ? 'greenyellow' :
                            'lime';
    }

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            mags = [0, 1, 2, 3, 4, 5],
            labels = [];



        // loop through the density intervals to create labels and assign color for each interval
        for (var i = 0; i < mags.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(mags[i] + 1) + '"> &nbsp;&nbsp;&nbsp;&nbsp; </i> ' +
                "<span style='color: white'>" + (mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+')) + "</span>";
            var htmllegend =
                '<i style="background:' + getColor(mags[i] + 1) + '">&nbsp;&nbsp;&nbsp;&nbsp;</i> ' +
                "<span style='color: white'>" + (mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+')) + "</span>";
            console.log(htmllegend);
            div.innerhtml += htmllegend;
        }
        return div;
    };

    legend.addTo(myMap);

}
