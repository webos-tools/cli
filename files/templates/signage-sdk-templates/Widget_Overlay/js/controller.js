/*jslint browser:true, unparam: true, indent: 4 */
/*global console, BindClass, Event */

/**
 * @file 'appSeven' represents one source of data.
 * When ever the changes happen in appSeven, data attributes which uses appSeven has to be updated.
 * In one page we can have multiple sources like 'appSeven' which represents multiple data sources.
 * but everything has to be instantiated using BindClass.
 * 
 * Manages the configuration of the HTML application. 
 * Loads JSON data into application to bind the data to the View(HTML page).
 * @author CSP-1
 */

/** @default city {String}
 *  @description Set City Name. Eg Seoul. Check http://openweathermap.org for more details.
 */
var city = 'Seoul',
/** @default country {String}
 *  @description Set Country Code Name. Eg KR for Korea. Check http://openweathermap.org for more details.
 */
    country = 'KR',
/** @default weatherKey {String}
*  @description Generate waether key from API (http://openweathermap.org)
*/
    weatherKey = 'a0bbc401d29647575dd7bbdf9515c3d4',
/** @default newsKey {String}
*  @description Generate news key from API (http://developer.nytimes.com/docs)
*/
    newsKey = 'a943d308db975625f7f59ec62c3fec64:8:70277878',
    weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + ',' + country + '&units=metric&APPID=' + weatherKey,
/** @default stockSymbols {String}
*  @description Check http://www.yahooapis.com/yql/guide/ for more details.
*/
    stockSymbols = ['066570.KS', 'KMI', 'BAC', 'VZ', 'PBR', 'FB', 'HAL', 'GE', 'CALA'],
    financeStocks = '%22' + stockSymbols[0] + '%22%2C%22' + stockSymbols[1] + '%22%2C%22' + stockSymbols[2] + '%22%2C%22' + stockSymbols[3] + '%22%2C%22' + stockSymbols[4] + '%22%2C%22' + stockSymbols[5] + '%22%2C%22' + stockSymbols[6] + '%22%2C%22' + stockSymbols[7] + '%22%2C%22' + stockSymbols[8] + '%22%',
    financeUrl = 'http://query.yahooapis.com/v1/public/yql?q=select%20%2a%20from%20yahoo.finance.quotes%20where%20symbol%20in%20%28' + financeStocks + '29%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json',
    newsSections = ['food', 'travel'],
    newsUrl = 'http://api.nytimes.com/svc/news/v3/content/nyt/' + newsSections[Math.floor(Math.random() * newsSections.length)] + '.json?limit=1&api-key=a943d308db975625f7f59ec62c3fec64:8:70277878';
/** @module ApplicationSeven */
var ApplicationSeven = (function () {
    'use strict';
    /**
     * @constructor App
     * @property {Object} info Sets Data Binding Object.
     * @property {Object} info1 Weather Data Binding Object.
     * @property {Object} info2 News Data Binding Object.
     */
    var App = function () {
        this.info = new BindClass('appSeven');
        this.info1 = new BindClass('appSeven');
        this.info2 = new BindClass('appSeven');
        this.stockList = document.getElementById('stockList');
        this.newsSlide = document.getElementById('slideContent');
    };
    /**
     * Represents a weather Icon Check.
     * This will be an instance member, App#weatherIconCheck.
     * @memberof App.prototype
     * @param {string} desc - based on weather description it returns related Icon.
     */
    App.prototype.weatherIconCheck = function (desc) {
        switch (desc.toLowerCase()) {
        case 'clear':
            return './res/images/clear.png';
        case 'rain':
        case 'drizzle':
            return './res/images/rain.png';
        case 'Thunderstorm':
            return './res/images/thunder.png';
        case 'snow':
            return './res/images/snow.png';
        case 'clouds':
            return './res/images/clouds.png';
        case 'haze':
        case 'mist':
            return './res/images/mist.png';
        default:
            return './res/images/default.png';
        }
    };
    /**
     * Represents a animation Class Add and remove Handler.
     * This will be an instance member, App#animationClassHandler.
     * @memberof App.prototype
     * @param {object} element - which has to be animated.
     * @param {string} className - animation  class.
     */
    App.prototype.animationClassHandler = function (element, className) {
        var scrTxt = 65,
            normalAnimTime = 40,
            animPercent = 0.6,
            elementTxt = element.innerText.length,
            animationTime = (normalAnimTime * elementTxt) / scrTxt,
            event = new Event('webkitAnimationEnd'),
            triggerTime = animationTime * animPercent * 1000;
        if (element.classList.contains(className)) {
            element.classList.remove(className);
            element.style.WebkitAnimation = 'slideInLeft';
            setTimeout(function () {
                element.classList.add(className);
                //we can do simple Join, but join is taking more time because only 3 strings are concatenated.
                element.style.WebkitAnimation = 'slideInRight ' + animationTime + 's';
            }, 1);
        } else {
            element.classList.add(className);
            element.style.WebkitAnimation = 'slideInRight ' + animationTime + 's';
        }
        setTimeout(function () {
            element.dispatchEvent(event);
        }, triggerTime);
    };
    /**
     * Represents a rounds float value.
     * This will be an instance member, App#round_float.
     * @memberof App.prototype
     * @param {number} x - float value.
     * @param {number} n - no of decimals.
     */
    App.prototype.round_float = function (x, n) {
        if (!parseFloat(x)) {
            return false;
        }
        return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
    };
    /**
     * Represents time and date updater .
     * This will be an instance member, App#timeSetter.
     * @memberof App.prototype
     * @param {Object} weatherInfo - time and date info.
     */
    App.prototype.timeSetter = function (weatherInfo) {
        var dateTime = new Date(),
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            weeks = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            time = '',
            date = '',
            hours = dateTime.getHours(),
            amPm = hours >= 12 ? 'PM' : 'AM',
            minutes = ('0' + dateTime.getMinutes()).slice(-2);
        if (hours >= 13) {
            hours = hours - 12;
        }
        hours = ('0' + hours).slice(-2);
        time = hours + ':' + minutes + ' ' + amPm + ' GMT';
        date = [ weeks[dateTime.getDay()], ' ', months[dateTime.getMonth()], ' ', dateTime.getDate(), ',', dateTime.getFullYear()].join(' ');

        weatherInfo.time = time;
        weatherInfo.date = date;

        return weatherInfo;
    };
    /**
     * Represents a default settings bindingInstance. 
     * data will be binded using set methods to View(Html page).</br>
     * @example
     * Example : this.info.set('video', dataArray.videoPath);</br>
     * It updates the bindings which has data attribute 'video' in respected View(Html page).
     * This will be an instance member, App#customSetter.
     * @memberof App.prototype
     * @param {Object} customData - data to set the default bindings.
     */
    App.prototype.customSetter = function (customData) {
        this.info.set('video', customData.videoPath);
        this.info.set('bgImg', customData.bgImgPath);
        this.info.set('positive', customData.positiveClass);
        this.info.set('negative', customData.negClass);
        this.info.set('positiveImgL', customData.posImgLarge);
        this.info.set('negativeImgL', customData.negImgLarge);
        this.info.set('positiveImgS', customData.posImgSmall);
        this.info.set('negativeImgS', customData.negImgSmall);
        this.info.set('defaultNewsImg', customData.defaultNewsImg);

        this.handlers();
    };
    /**
     * Represents a weather bindingInstance.
     * This will be an instance member, App#weatherSetter.
     * @memberof App.prototype
     * @param {Object} weather - Weather Information.
     * @param {Object} flag - it represents file loading from local or API
     */
    App.prototype.weatherSetter = function (weather, flag) {
        var weatherData = '',
            temp = '',
            icon = '';
        if (flag) {
            temp = weather.main.temp;
            icon = this.weatherIconCheck(weather.weather[0].main);
            weatherData = {
                'info': {
                    'city': weather.name,
                    'time': '08:30 AM GMT',
                    'date': 'Wednesday November 3, 2014'
                },
                'weather': {
                    'value': this.round_float(temp, 1), //we can use .toFixed method, but for single digits it returns with .0 Ex: 24.0 
                    'image': icon,
                    'status': weather.weather[0].description
                }
            };
        } else {
            weatherData = weather;
        }
        this.info1.set('weatherInfo', this.timeSetter(weatherData.info));
        this.info1.set('weatherValue', weatherData.weather.value);
        this.info1.set('weatherImage', weatherData.weather.image);
        this.info1.set('weatherStatus', weatherData.weather.status);
    };
    /**
     * Represents a News bindingInstance.
     * This will be an instance member, App#newsSetter.
     * @memberof App.prototype
     * @param {Object} newsData - News Information.
     * @param {Object} flag - it represents file loading from local or API
     */
    App.prototype.newsSetter = function (newsData, flag) {
        var newsItem = '',
            image = '',
            preImage = new Image(),
            newsImg = document.getElementById('newsImg'),
            mrgnTop = 0;
        if (flag) {
            if (newsData.results[0].multimedia !== '') {
                image = newsData.results[0].multimedia[0].url;
                image = image.split('/');
                image[image.length - 1] = image[image.length - 2] + '-blog480.jpg';
                image = image.join('/');
                preImage.src = image;
                preImage.onload = function () {
                    mrgnTop = (((398 / 480) * (this.height)) - 224) / 2;
                    newsImg.style.marginTop = '-' + mrgnTop + 'px';
                };
            } else {
                image = this.info.get('defaultNewsImg');
            }
            newsItem = {
                'image': image,
                'title': 'The Latest News',
                'newsHeadLine': newsData.results[0].title,
                'newsContent': newsData.results[0].abstract
            };
        } else {
            newsItem = newsData;
        }

        this.info2.set('newsImage', newsItem.image);
        this.info2.set('latestNewsTitle', newsItem.title);
        this.info2.set('latestNewsHeadLine', newsItem.newsHeadLine);
        this.info2.set('latestNewsContent', newsItem.newsContent);

        this.animationClassHandler(this.newsSlide, 'slideContentAnim');
    };
    /**
     * Represents a Stock bindingInstance.
     * This will be an instance member, App#shareSetter.
     * @memberof App.prototype
     * @param {Object} sharesInfo - Stocks Information.
     * @param {Object} flag - it represents file loading from local or API
     */
    App.prototype.shareSetter = function (sharesInfo, flag) {
        var shareItem = "", len = sharesInfo.length, model = {}, template = [], colorClass = "", imgL = "", imgS = "", i = "", tempItem = [], pstFlag;
        if (flag) {
            shareItem = sharesInfo.query.results.quote;
            len = shareItem.length;
            for (i = 0; i < len; i += 1) {
                pstFlag = shareItem[i].Change.indexOf('+') !== -1 ? true : false;

                shareItem[i].Change = pstFlag ? shareItem[i].Change.replace('+', '') : shareItem[i].Change.replace('-', '');
                shareItem[i].PercentChange = pstFlag ? shareItem[i].PercentChange.replace('+', '') : shareItem[i].PercentChange.replace('-', '');
                shareItem[i].PercentChange = shareItem[i].PercentChange.replace('%', '');
                shareItem[i].PercentChange = shareItem[i].PercentChange.length > 4 ? Math.round(shareItem[i].PercentChange * 10) / 10 : shareItem[i].PercentChange;

                tempItem.push({ 'company': shareItem[i].Name, 'share': shareItem[i].LastTradePriceOnly, 'change': shareItem[i].Change, 'changeinPercentage': shareItem[i].PercentChange, 'positive': pstFlag});
            }
            shareItem = tempItem;
        } else {
            shareItem = sharesInfo;
        }

        for (i = 0; i < len; i += 1) {
            model = shareItem[i];
            colorClass = model.positive ? this.info.get('positive') : this.info.get('negative');
            imgL = model.positive ? this.info.get('positiveImgL') : this.info.get('negativeImgL');
            imgS = model.positive ? this.info.get('positiveImgS') : this.info.get('negativeImgS');

            template.push('<li><div class=openContent> <div>' + model.company + '</div> <div> <span class=stockVal>' + model.share + '</span> <span class="valueChange ' + colorClass + '">' + model.change + '</span><span class=greenCaret><img src=' + imgS + ' /></span><span class="valuePChange ' + colorClass + ' ">' + model.changeinPercentage + '</span></div></div>');
            template.push('<div class=closeContent><h2>' + model.company + '</h2> <div> <label class=stockLbl>Latest</label> <span class=stockClsVal>' + model.share + '</span> <label class=valChgLbl>Change</label><span class=valueClsChange><img src=' + imgL + ' /><h3 class=' + colorClass + '>' + model.change + '</h3></span> <label class=valChgPLbl>Change %</label><span class=valueClsPChange><img src=' + imgL + ' /><h3 class=' + colorClass + '>' + model.changeinPercentage + '</h3></span></div></div></li>');
        }
        this.stockList.innerHTML = template.join('');
    };
    /**
     * Represents a Ajax Reauest.
     * This will be an instance member, App#reqMethod.
     * @memberof App.prototype
     * @param {string} method - method of the request.
     * @param {string} url - url of the request.
     * @param {function} reqMethod - success call back function.
     */
    App.prototype.reqMethod = function (method, url, reqMethod) {
        try {
            var req = new XMLHttpRequest(),
                dataSet = '',
                that = this;

            req.open(method, url, false);
            req.onload = function () {
                dataSet = JSON.parse(req.responseText);
                if (reqMethod !== that.customSetter) {
                    dataSet = dataSet[Math.floor(Math.random() * dataSet.length)];
                }
                reqMethod.call(that, dataSet);
            };
            req.onerror = function () {
                throw 'Cannot load file ' + url;
            };
            req.send();

        } catch (e) {
            console.log('%c Error: Issue in js/controller.js/reqMethod -- ' + e.message, 'background-color:red;color:white;');
        }
    };
    /**
     * Represents a Ajax Reauest.
     * This will be an instance member, App#apiReqMethod.
     * @memberof App.prototype
     * @param {string} method - method of the request.
     * @param {string} url - url of the request.
     * @param {function} reqMethod - success call back function.
     * @param {string} localFile - load local file in case of failure
     */
    App.prototype.apiReqMethod = function (method, url, reqMethod, localFile) {
        try {
            var req = new XMLHttpRequest(),
                dataSet = "",
                that = this;

            req.open(method, url, false);
            req.onload = function () {
                dataSet = JSON.parse(req.responseText);
                reqMethod.apply(that, [dataSet, true]);
            };
            req.onerror = function () {
                //If error occurs
                reqMethod(method, localFile, reqMethod);
                throw 'Cannot load file ' + url + 'loading local file' + localFile;
            };
            req.send();
        } catch (e) {
            console.log('%c Error: Issue in js/controller.js/apiReqMethod -- ' + e.message, 'background-color:red;color:white;');
            console.log('%c loading local file --' + localFile, 'background-color:green;color:white;');
            this.reqMethod(method, localFile, reqMethod);
        }
    };
    /**
     * Represents events Handler.EventListeners were added in handlers method.
     * This will be an instance member, App#handlers.
     * @memberof App.prototype
     */
    App.prototype.handlers = function () {
        var that = this;
        /**
         * News Animation End event.
         *
         * @event App#NewsAnimationEnd
         */
        this.newsSlide.addEventListener('webkitAnimationEnd', function () {
            newsUrl = 'http://api.nytimes.com/svc/news/v3/content/nyt/' + newsSections[Math.floor(Math.random() * newsSections.length)] + '.json?limit=1&api-key=a943d308db975625f7f59ec62c3fec64:8:70277878';
            that.apiReqMethod('GET', newsUrl, that.newsSetter, 'data/newsWidget.json');
        });
    };
    return App;
}());

var appInstance = new ApplicationSeven();
appInstance.reqMethod('GET', 'data/data.json', appInstance.customSetter);

//appInstance.reqMethod('GET', 'data/weatherWidget.json', appInstance.weatherSetter);
//appInstance.reqMethod('GET', 'data/newsWidget.json', appInstance.newsSetter);
//appInstance.reqMethod('GET', 'data/shareWidget.json', appInstance.shareSetter);

appInstance.apiReqMethod('GET', weatherUrl, appInstance.weatherSetter, 'data/weatherWidget.json');
appInstance.apiReqMethod('GET', newsUrl, appInstance.newsSetter, 'data/newsWidget.json');
appInstance.apiReqMethod('GET', financeUrl, appInstance.shareSetter, 'data/shareWidget.json');

setInterval(function () {
    appInstance.apiReqMethod('GET', weatherUrl, appInstance.weatherSetter, 'data/weatherWidget.json');
    appInstance.apiReqMethod('GET', financeUrl, appInstance.shareSetter, 'data/shareWidget.json');
}, 100000);

