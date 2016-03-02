function addMarkers(map){
var markers = [];
var Marker = google.maps.Marker;
var LatLng = google.maps.LatLng;
markers.push(new Marker({
	position: new LatLng(45.5244002, -122.6804891),
	map: map,
	title: 'Oregon Novelties',
}));
markers.push(new Marker({
	position: new LatLng(44.055217, -121.297892),
	map: map,
	title: 'Aunt Beru\\\s Oregon Souveniers',
}));
markers.push(new Marker({
	position: new LatLng(45.715849, -123.937993),
	map: map,
	title: 'Bruce\\\s Bric-a-Brac',
}));
markers.push(new Marker({
	position: new LatLng(44.5783785, -123.2677716),
	map: map,
	title: 'Oregon Goodies',
}));
markers.push(new Marker({
	position: new LatLng(45.5893574, -122.5933326),
	map: map,
	title: 'Oregon Grab-n-Fly',
}));
}