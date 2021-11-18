// map object
const myMap = {
	coordinates: [],
	businesses: [],
	map: {},
	markers: {},

	// build leaflet map
	buildMap() {
		this.map = L.map('map', {
			center: this.coordinates,
			zoom: 11,
		});
		// add openstreetmap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			minZoom: '15',
		}).addTo(this.map)
		// create and add geolocation marker
		const marker = L.marker(this.coordinates)
		marker
			.addTo(this.map)
			.bindPopup('<p1><b>You are here</b><br></p1>')
			.openPopup()
	},

	// add business markers
	addMarkers() {
		for (var i = 0; i < this.businesses.length; i++) {
			this.markers = L.marker([
				this.businesses[i].lat,
				this.businesses[i].long,
			])
				.addTo(this.map)
				.bindPopup(`<p1>${this.businesses[i].name}</p1>`)
				.openPopup()
		}
	},
}

// get coordinates via geolocation api
async function getCoords(){
	const pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	});
	return [pos.coords.latitude, pos.coords.longitude]
}

// get foursquare businesses
async function getFoursquare(business) {
	let clientId = '3J5YYNCNKZRXEAIRVG3SBTUIGGHSSZLSUYVGAL4IPG0EPA34'
	let clentSecret = 'IPGTGUNL5IUETNNIQXNVXWQD2AB1QDIWZZY0B5UXB0NHPDQU'
	let limit = 5
	let lat = myMap.coordinates[0]
	let lon = myMap.coordinates[1]
	let response = await fetch(
		`https://api.foursquare.com/v2/venues/explore?client_id=${clientId}&client_secret=${clentSecret}&v=20180323&limit=${limit}&ll=${lat},${lon}&query=${business}`
	);
	let data = await response.text()
	let parsedData = JSON.parse(data)
	if (parsedData.response.groups == undefined || parsedData.response.groups.length <= 0) {
		alert("Nothing found!")
		return []
	}
	let businesses = parsedData.response.groups[0].items
	return businesses
}

// process foursquare array
function processBusinesses(data) {
	let businesses = data.map((element) => {
		let location = {
		name: element.venue.name,
		lat: element.venue.location.lat,
		long: element.venue.location.lng,
		};
		return location
	})
	return businesses
}

// event handlers
// window load
window.onload = async () => {
	const coords = await getCoords()
	myMap.coordinates = coords
	myMap.buildMap()
}

// business submit button
document.getElementById('submit').addEventListener('click', async (event) => {
	event.preventDefault()
	let business = document.getElementById('business').value;
	let data = await getFoursquare(business)
	myMap.businesses = processBusinesses(data)
	myMap.addMarkers()
})
