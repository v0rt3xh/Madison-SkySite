// Here we have the information from inqurySite
let lat = site.geometry.coordinates[1];
let lon = site.geometry.coordinates[0];
let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat}%2C%20${lon}/next24hours?unitGroup=metric&elements=datetime%2Ctemp%2Cdew%2Chumidity%2Cwindspeed%2Cpressure%2Ccloudcover%2Cvisibility%2Csunrise%2Csunset%2Cmoonphase%2Cconditions%2Cdescription%2Cicon&include=hours%2Ccurrent&key=${weatherKey}&contentType=json`;
let forecastStatus = false;
let forecastAccess = new XMLHttpRequest();

// Utility functions
const transferTime = function(timeStr) {
	let numericTime = Number(timeStr);
	const postFix = ':00:00';
	if (numericTime === 0) {
		return '00' + postFix;
	} else if (numericTime <= 10) {
		return '0' + (numericTime - 1).toString() + postFix;
	} else {
		return (numericTime - 1).toString() + postFix;
	}
};

forecastAccess.open('GET', url, true);

forecastAccess.onload = function() {
	// Begin accessing JSON data here
	if (forecastAccess.readyState === 4) {
		if (forecastAccess.status === 200) {
			forecastStatus = true;
			let response = JSON.parse(forecastAccess.responseText);
			// Get the information we need
			const currentInfo = response.currentConditions;
			console.log(currentInfo);
			const todayInfo = response.days[0];
			const tomorrowInfo = response.days[1];
			// Retrieve current condition
			const sunsetTime = transferTime(todayInfo.sunset.slice(0, 2));
			const sunriseTime = transferTime(tomorrowInfo.sunrise.slice(0, 2));
			// Get the prediction slice
			const sunsetInfo = todayInfo.hours.filter((hourInfo) => hourInfo.datetime === sunsetTime)[0];
			const sunriseInfo = tomorrowInfo.hours.filter((hourInfo) => hourInfo.datetime === sunriseTime)[0];
			document.getElementById('currentTmp').innerHTML = `<span>${currentInfo.temp} &#8451</span>`;
			document.getElementById('currentCC').innerHTML = `<span>${currentInfo.cloudcover}%</span>`;
			document.getElementById('currentHumid').innerHTML = `<span>${currentInfo.humidity}%</span>`;
			document.getElementById('currentWind').innerHTML = `<span>${(currentInfo.windspeed / 3.6).toFixed(
				1
			)} m/s</span>`;
			document.getElementById('sunriseTime').innerHTML = `<span>${tomorrowInfo.sunrise.slice(0, 5)}</span>`;
			document.getElementById('sunriseTmp').innerHTML = `<span>${sunriseInfo.temp} &#8451</span>`;
			document.getElementById('sunriseCC').innerHTML = `<span>${sunriseInfo.cloudcover}%</span>`;
			document.getElementById('sunriseHumid').innerHTML = `<span>${sunriseInfo.humidity}%</span>`;
			document.getElementById('sunriseWind').innerHTML = `<span>${(sunriseInfo.windspeed / 3.6).toFixed(
				1
			)} m/s</span>`;
			document.getElementById('sunsetTime').innerHTML = `<span>${todayInfo.sunset.slice(0, 5)}</span>`;
			document.getElementById('sunsetTmp').innerHTML = `<span>${sunsetInfo.temp} &#8451</span>`;
			document.getElementById('sunsetCC').innerHTML = `<span>${sunsetInfo.cloudcover}%</span>`;
			document.getElementById('sunsetHumid').innerHTML = `<span>${sunsetInfo.humidity}%</span>`;
			document.getElementById('sunsetWind').innerHTML = `<span>${(sunsetInfo.windspeed / 3.6).toFixed(
				1
			)} m/s</span>`;
		} else {
			console.error(forecastAccess.statusText);
		}
	}
};

forecastAccess.send();
// Get the weather data
