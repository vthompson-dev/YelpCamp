const mapDiv = document.getElementById('map');

const campground = JSON.parse(mapDiv.dataset.campground);
const maptilerApiKey = mapDiv.dataset.apiKey;

maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: campground.geometry.coordinates,
    zoom: 10,
    terrainControl: true,
    scaleControl: true,
    fullscreenControl: "top-left",
    geolocateControl: true
});

new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)