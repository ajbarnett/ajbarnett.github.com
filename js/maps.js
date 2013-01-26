var Mapper = function() {
	this.MAP_ID = '#map-canvas'
	this.$map = $(this.MAP_ID);

	this.init();

};

Mapper.prototype.init = function() {
	if (typeof google === "undefined") { return; }

	this.places = this.buildPlaces();
	this.map = this.buildMap();
	this.initLocationsPicker();
	//this.getDirections(this.places[2], this.places[1]);
};

Mapper.prototype.initLocationsPicker = function() {
	var $from = $('#map-from'),
		$to = $('#map-to');

	$from.append(
		this.buildLocationPicker("from", ["dia", "boulderado", "lionscrest"])
	);
	$to.append(
		this.buildLocationPicker("to", ["boulderado", "lionscrest", "dia"])
	);

	this.bindLocationClick();
};

Mapper.prototype.bindLocationClick = function() {
	var self = this;
	$('#map-picker').on('click', '.location', function(){
		var $loc = $(this);

		if ($loc.hasClass('active') || $loc.hasClass('disabled')) { return; }

		var $radio = $loc.find('input'),
			name = $radio.attr('name'),
			value = $radio.val(),
			$otherSide = $loc.closest('.locations').siblings(),
			locations = {},
			otherLocObj,
			places = self.places;

		// check my radio
		$radio.attr('checked', 'checked');

		if (name === 'from') {
			// go to the other side and disable the one with the same value as me 
			self.updateOtherSide(value, $otherSide);
		}

		// if there is another active location on my side, deactivate it
		self.deactivateLocation($loc.siblings('.active'));

		// activate
		self.activateLocation($loc);

		// build up locations object
		locations = self.buildLocations(places, name, value, $otherSide);

		// if we have valid locations, get directions
		if (self.hasValidLocation(locations, 'from') && self.hasValidLocation(locations, 'to')) {
			self.getDirections(locations)
				.then(function(){
					setTimeout(function(){
						$(window).trigger('.scrollToMap');
					}, 500);						
				})
				.fail(function(msg){
					if (window.console && console.log) {
						console.log(msg);
					}
				});
		}
	});
};

Mapper.prototype.buildLocations = function(places, name, value, $otherSide) {
	var locs = {},
		$otherActive = $otherSide.find('.location.active');

	locs[name] = places[value];
	if ($otherActive.length) {
		locs = $.extend(locs, this.getLocationObject(places, $otherActive));
	}
	return locs;
};

Mapper.prototype.hasValidLocation = function(locations, key) {
	return locations.hasOwnProperty(key) && locations[key] !== undefined;
};

Mapper.prototype.getLocationObject = function(places, $location) {
	var o = {},
		$input = $location.find('input'),
		val,
		name;

	if ($input.length) {
		name = $input.attr('name');
		val = $input.val();
		if (val !== undefined && val.length) {
			o[name] = places[val];
		}
	}

	return o;
};

Mapper.prototype.updateOtherSide = function(newVal, $otherSide) {
	if (newVal === undefined || !newVal.length || !$otherSide.length) { 
		return;
	}

	var $locations = $otherSide.find('.location'),
		$disabled = $locations.filter('.disabled'),
		$sameVal = $locations.find('input[value=' + newVal + ']').closest('.location');

	if (!$disabled.is($sameVal)) {
		this.disableLocation($sameVal);
		this.enableLocation($disabled);
		if ($sameVal.hasClass('active')) {
			this.deactivateLocation($sameVal);
		}
	}

};

Mapper.prototype.disableLocation = function($location) {
	$location.addClass('disabled').find('input').prop('disabled', 'disabled');
};

Mapper.prototype.enableLocation = function($location) {
	$location.removeClass('disabled').find('input').prop('disabled', false);
};

Mapper.prototype.deactivateLocation = function($location) {
	if ($location !== undefined && $location.length) {
		$location
			.removeClass('active')
			.find('.address')
				.slideUp()
				.end()
			.find('input')
				.attr('checked', false)
				.prop('checked', false);
	}
};

Mapper.prototype.activateLocation = function($location) {
	if ($location !== undefined && $location.length) {
		$location.addClass('active').find('.address').slideDown();
	}
};

Mapper.prototype.buildLocationPicker = function(name, orderedPlaces) {
	var html = [],
		places = this.places;

	for (var i = 0, l = orderedPlaces.length; i < l; i++) {
		html.push(
			this.buildLocation(
				name,
				places,
				orderedPlaces[i]
			)
		);
	}

	return html.join('');
};

Mapper.prototype.buildLocation = function(name, places, placeId) {
	var place = places[placeId];

	if (place === undefined) { return ''; }

	var html = [
		'<div class="location">',
			'<input type="radio" name="' + name + '" value="' + placeId + '" />',
			'<h5>' + place.name + '</h5>',
			'<div class="address">' + place.address + '</div>',
		'</div>'
	];

	return html.join('');
};

Mapper.prototype.buildPlaces = function() {
	if (typeof this.places !== "undefined") {
		return this.places;
	}
	
	return {
		dia: {
			name: "Denver International Airport",
			coords: [39.8396499, -104.6770477],
			address: "8500 Pe&ntilde;a Boulevard<br>Denver, CO<br>80249-6340",
			googAddress: "8500 Pena Boulevard, Denver, CO 80249-6340"
		},
		boulderado: {
			name: "Hotel Boulderado",
			coords: [40.0194339, -105.2792882],
			address: "2115 13th St<br>Boulder, CO<br>80302",
			googAddress: "2115 13th St, Boulder, CO 80302"
		},
		lionscrest: {
			name: "Lionscrest Manor",
			coords: [40.224434, -105.280459],
			address: "603 Indian Lookout Road<br>Lyons, CO<br>80540",
			googAddress: "603 Indian Lookout Road, Lyons, CO 80540"
		}
	};	
};

Mapper.prototype.buildMap = function() {
	var $map = this.$map,
		gmaps = google.maps;

	if ($map === undefined || !$map.length || gmaps === undefined) { 
		return; 
	}

	return new gmaps.Map($map.get(0), {
		center: new gmaps.LatLng(40.05, -105.249023),
		zoom: 9,
		mapTypeId: gmaps.MapTypeId.ROADMAP
	});
};

Mapper.prototype.getDirections = function(locations) {
	var map = this.map,
		from = locations && locations.from || {},
		to = locations && locations.to || {},
		directionsDisplay = this.getDirDisplay(),
		directionsService = this.getDirService(),
		request = {
			origin: from.googAddress,
			destination: to.googAddress,
			travelMode: google.maps.TravelMode.DRIVING
		},
		dfd = $.Deferred();

	if (typeof request.origin === "undefined" || typeof request.destination === "undefined") {
		dfd.reject("Missing at least one location.");
	}
	else if (request.origin === request.destination) {
		dfd.reject("Origin and destination are the same.")
	}
	else {
		directionsService.route(request, function(response, status) {
			console.log(response);
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
				dfd.resolve();
			}
			else {
				dfd.reject("The Directions Service failed. Status: " + status);
			}
		});
	}

	return dfd.promise();
};

Mapper.prototype.clearMap = function() {
	var map = this.map,
		directionsDisplay = this.directionsDisplay;

	if (directionsDisplay !== undefined) {
		directionsDisplay.setMap(null);
	}
};

Mapper.prototype.getDirDisplay = function() {
	var directionsDisplay = this.directionsDisplay,
		panel = document.getElementById("directions-panel");

	panel.innerHTML = '';

	if (directionsDisplay === undefined) {
		this.directionsDisplay = directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(this.map);
		directionsDisplay.setPanel(panel);
	}

	return directionsDisplay;
};

Mapper.prototype.getDirService = function() {
	var service = this.directionsService;

	if (service === undefined) {
		this.directionsService = service = new google.maps.DirectionsService();
	}

	return service;
};

var m;
$(document).ready(function(){
	m = new Mapper();
});
















/*
var InitMap = function(){
	var mapOptions = {
		center: new google.maps.LatLng(40.05, -105.249023),
		zoom: 9,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	var place;
	for (var i = 0, l = places.length; i < l; i++) {
		place = places[i];
		place.marker = new google.maps.Marker({
			position: new google.maps.LatLng(place.coords[0], place.coords[1]),
			map: map,
			title: place.name
		});
	}
};
*/