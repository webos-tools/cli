/*global BindClass, console: false */
/*jslint browser: true, indent: 4 */

/**
 * @file Manages the configuration of the HTML application. 
 * Loading the JSON data in application to binding the data into the page.
 * Open Weather API has been used http://openweathermap.org .
 * @author LG CSP-1
 */

/**
 * Description of module, defines module for whole file
 * @lends module: closureFunction
 * @module closureFunction
 */
(function () {
    'use strict';
    /* Set All the Propeties of Location , Area, City and interval timeCheck for Weather Update */
    var info, dataSet,
        /** @member timeSetter {Number}
         *  @description Interval for Weather API call in second
         */
        timeSetter = 5,
        /** @member city {String}
         *  @description Set City Name. Eg Seoul. Check http://openweathermap.org for more details.
         */
        //city = 'Seoul',
        /** @member country {String}
         *  @description Set Country Code Name. Eg KR for Korea. Check http://openweathermap.org for more details.
         */
        //country = 'KR',
        cityCountry = [ {city : 'Seoul,KR', location : 'Seoul, South Korea,'},
                        {city : 'Bengaluru,IN', location : 'Bengaluru, India,'},
                        {city : 'London,GB', location : 'London, England'},
                        {city : 'Busan,KR', location : 'Busan, South Korea,'},
                        {city : 'New York,US', location : 'New York, USA,'}
                    ],
        count = 0,
        /** @member weatherKey {String}
         *  @description Generate waether key from API (http://openweathermap.org)
         */
        weatherKey = 'a0bbc401d29647575dd7bbdf9515c3d4',
        //weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + ',' + country + '&units=metric&APPID=' + weatherKey,
        weatherDemoUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityCountry[count].city + '&units=metric&APPID=' + weatherKey,
        /** @member settings {String}
         *  @description Set timeFormat as 12hr or 24hr
         */
        settings = {
            timeFormat: '12hr' /* For Time Format 12HR/24 HR */
        },
        ajaxImageCentered = document.getElementById('centered');
   /**
     * Sets Weather icon, condition type and image in the application.
     * Please look for Weather climate/condition codes (http://openweathermap.org/weather-conditions) for more details.
     * @method setIconAndImage()
     */
    function setIconAndImage(climate, description) {
        climate = climate.toLowerCase();
        switch (climate) {
        case 'clear sky':
        case 'clear':
            info.set('weatherLogo', dataSet.weatherLogoSunny);
            info.set('conditions', dataSet.conditionsSunny);
            info.set('brandAdvertisement', dataSet.brandAdvertisementSunny);
            break;
        case 'drizzle':
        case 'light rain':
        case 'drizzle rain':
        case 'moderate rain':
            info.set('weatherLogo', dataSet.weatherLogoRainy);
            info.set('conditions', dataSet.conditionsRainy);
            info.set('brandAdvertisement', dataSet.brandAdvertisementRainy);
            break;
        case 'snow':
        case 'fog':
        case 'haze':
        case 'smoke':
        case 'mist':
            info.set('weatherLogo', dataSet.weatherLogoSnowy);
            info.set('conditions', dataSet.conditionsSnowy);
            info.set('brandAdvertisement', dataSet.brandAdvertisementSnowy);
            break;
        case 'windy':
            info.set('weatherLogo', dataSet.weatherLogoWindy);
            info.set('conditions', dataSet.conditionsWindy);
            info.set('brandAdvertisement', dataSet.brandAdvertisementWindy);
            break;
        case 'heavy thunderstorm':
        case 'thunderstorm with rain':
        case 'thunderstorm':
        case 'tornado':
            info.set('weatherLogo', dataSet.weatherLogoThunder);
            info.set('conditions', dataSet.conditionsThunder);
            info.set('brandAdvertisement', dataSet.brandAdvertisementThunder);
            break;
        case 'cloudy':
        case 'clouds':
            info.set('conditions', dataSet.conditionsCloudy);
            info.set('weatherLogo', dataSet.weatherLogoCloudy);
            info.set('brandAdvertisement', dataSet.brandAdvertisementCloudy);
            break;
        case 'partly-cloudy-day':
        case 'few clouds':
            info.set('conditions', dataSet.conditionsPartlyCloudy);
            info.set('weatherLogo', dataSet.weatherLogoPartlyCloudy);
            info.set('brandAdvertisement', dataSet.brandAdvertisementPartlyCloudy);
            break;
        default:
            info.set('conditions', dataSet.conditionsCloudy);
            info.set('weatherLogo', dataSet.weatherLogoCloudy);
            info.set('brandAdvertisement', dataSet.brandAdvertisementCloudy);
            break;
        }
        //info.set('conditions', description);
    }
    /**
     * Returns rounding off temperature
     * @method round_float()
     * @return {String} Returns 10.12 => 10
     */
    function round_float(x, n) {
        if (!parseFloat(x)) {
            return false;
        }
        return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
    }
    /**
     * Returns time from 9:5 => 09:05 format
     * @method zeroPad()
     * @return {String} Returns time from 9:5 => 09:05 format
     */
    function zeroPad(num) {
        return (num < 10 ? '0' : '') + num;
    }

    /**
     * Returns time in AM/PM HH:MM format
     * @method displayClock()
     * @return {String} Returns time in AM/PM HH:MM format
     */
    function displayClock() {
        var dateTime = new Date(),
            hours = dateTime.getHours(),
            minutes = zeroPad(dateTime.getMinutes()),
            ampm = (dateTime.getHours() >= 12) ? 'PM' : 'AM',
            textTime;
        if (dateTime.getHours() >= 13 && settings.timeFormat === '12hr') {
            hours = hours - 12;
        }
        hours = zeroPad(hours);
        if (settings.timeFormat === '24hr') {
            textTime = ampm + ' ' + hours + ':' + minutes;
        } else {
            textTime = ampm + ' ' + hours + ':' + minutes;
        }
        return textTime;
    }
    setInterval(function () {
        info.set('time', displayClock());
    }, 60000);

    /**
     * Binds data to HTML Page.
     * @method bindData()
     * @param {Object} jsonData - Object contains data to put into HTML
     * @example
     * For Example : 
     * 'jsonData.location' will hold the content to be put into the html page.
     * For Span Tag attribute 'data-bind-templateEight', we set value as 'location'(See Below).
     *               
     *     //  span data-bind-templateEight = "location"
     *       
     * To set the value from Object to html tag, we need to put the code : 
     *     //  info.set('location', jsonData.location)
     *
     * here, first argument is the name of html tag's attribute value and,
     *             second is the value from javascript Object.
    */
    function bindData(jsonData) {
        info = new BindClass('templateEight');
        //Text Cases
        info.set('ajaxImage', jsonData.ajaxImage);
        info.set('location', jsonData.location);
        info.set('time', displayClock());
        info.set('area', jsonData.area);
        info.set('temp', jsonData.temp);
        info.set('bannerTagLine', jsonData.bannerTagLine);
        info.set('bannerLine', jsonData.bannerLine);
    }
    /**
     * Represents Ajax Reauest to load JSON Data.
     * @method loadDoc()
     * @param {string} method - method of the request.
     * @param {string} url - url of the request.
     */
    function loadDoc(method, url) {
        var req = new XMLHttpRequest();
        req.open(method, url, false);
        req.onload = function () {
            dataSet = JSON.parse(req.responseText);
            bindData(dataSet);
        };
        req.onerror = function () {
            throw 'Cannot load file ' + url;
        };
        req.send();
    }
    /** @function */
    loadDoc('GET', 'data/data.json');

    /**
     * AJAX Call to OpenWeathear API, and setIconandImage method invocation on successfull call.
     * In Case of no internet, set to default values as Sunny.
     * @method getTemperature()
     */
    function getTemperature() {
        try {
            var xmlhttp, response;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                        response = JSON.parse(xmlhttp.responseText);
                        if (response.main.temp < 0) {
                            info.set('temp', round_float(response.main.temp, 0));
                        } else {
                            info.set('temp', round_float(response.main.temp, 1));
                        }
                        // Setting Icon and Image
                        setIconAndImage(response.weather[0].main, response.weather[0].description);
                        ajaxImageCentered.style.display = 'none';
                        // Taking from Dummy
                        info.set('location', cityCountry[count].location);
                    } else if (xmlhttp.readyState === 4 && xmlhttp.status === 0) {
                        /* In case of Failure, setting default */
                        info.set('temp', dataSet.temp);
                        info.set('brandAdvertisement', dataSet.brandAdvertisementSunny);
                        ajaxImageCentered.style.display = 'none';
                    }
                };
                xmlhttp.open('GET', weatherDemoUrl, true);
                xmlhttp.send();
            }
        } catch (e) {
            console.log(' error' + e.message);
        }
    }
    /* Checking for Current Weather */
    setInterval(function () {
        try {
            if (count < cityCountry.length - 1) {
                ++count;
            } else {
                count = 0;
            }
            weatherDemoUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityCountry[count].city + '&units=metric&APPID=' + weatherKey;
            getTemperature();
        } catch (e) {
            console.log(e.message);
        }
    }, timeSetter * 1000);

    /** @function */
    getTemperature();
}());
