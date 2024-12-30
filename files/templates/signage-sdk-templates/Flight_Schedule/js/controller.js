/*jslint browser:true, unparam: true, nomen: true, indent: 4 */
/*global console, io, BindClass, capitaliseFirstLetter */

/**
 * @file Manages the configuration of the HTML application. 
 * Loads JSON data into application to bind the data to the View(HTML page).
 * @author CSP-1
 */

/** @module ApplicationFive */

var ApplicationFive = (function () {
    'use strict';
    /**
     * @constructor App
     * @property {Object} socket to connect to server.
     * @property {Object} info Sets Data Binding Object.
     * @property {Object} info2 default or static settings.
     */
    var App = function () {
        this.info = new BindClass('appFive');
        this.info2 = new BindClass('appFiveStatic');
    };
    /**
     * Represents JSON prettifier.
     * This will be an instance member, App#jsonFormatter.
     * @memberof App.prototype
     * @param {Object} data - which has to be prettify.
     * @param {number} space - spacing.
     */
    App.prototype.jsonFormatter = function (data, space) {
        return JSON.stringify(data, null, space);
    };

    /**
     * Represents a Ajax Reauest.
     * This will be an instance member, App#reqMethod.
     * @memberof App.prototype
     * @param {string} method - method of the request.
     * @param {string} url - url of the request.
     * @param {string} attr - which has to be set.
     * @param {Object} data - data.
     * @param {string} appHeaders - Application Headers.
     */
    App.prototype.reqMethod = function (method, url, attr, data, appHeaders) {
        try {
            var req = new XMLHttpRequest(),
                myArr = [],
                that = this;

            req.open(method, url, false);

            req.onload = function () {
                if (attr !== 'undefined' && method === 'GET') {
                    myArr = JSON.parse(req.responseText);
                    that.info.set(attr, myArr);
                }
            };
            req.onerror = function () {
                throw 'Cannot load file ' + url;
            };

            if (method !== 'GET' && data !== 'undefined' && appHeaders !== 'undefined') {
                req.setRequestHeader('Content-type', appHeaders);
                req.send(data);
            } else {
                req.send();
            }
        } catch (e) {
            console.log('error in reqMethod' + e.message);
        }
    };
    /**
     * Represents a simple Ajax Reauest.
     * This will be an instance member, App#requestMethod.
     * @memberof App.prototype
     * @param {string} method - method of the request.
     * @param {string} url - url of the request.
     * @param {string} records - request method check.
     */
    App.prototype.requestMethod = function (method, url, records) {
        try {
            var req = new XMLHttpRequest(),
                dataset = "",
                count = '',
                that = this,
                counter = 0,
                skip = 0,
                limit = 10,
                round = 0;

            req.open(method, url, false);
            req.onload = function () {
                if (records !== undefined) {
                    count = JSON.parse(req.responseText).count;
                    console.log('No .of Records in DB ' + count);
                    round = Math.floor(count / limit);
                    console.log('Skip ' + skip);
                    that.reqMethod('GET', url + '/' + skip, 'tabLeftData');
                    setInterval(function () {
                        if (counter < round) {
                            counter++;
                            skip += 10;
                        } else {
                            counter = 0;
                            skip = 0;
                        }
                        console.log('Skip ' + skip);
                        that.reqMethod('GET', url + '/' + skip, 'tabLeftData');
                    }, 10000);
                } else {
                    dataset = JSON.parse(req.responseText);
                    that.socket = io.connect(dataset.ipWithPort);
                    that.apiMethod = dataset.getApiMethod;
                    that.otherInfo = {
                        'title' : dataset.title
                    };
                    that.requestMethod('GET', dataset.getApiMethod, 'noOfRecords');
                }
            };
            req.onerror = function () {
                throw 'Cannot load file ' + url;
            };
            req.send();

        } catch (e) {
            console.log('%c Error: Issue in js/controller.js/requestMethod -- ' + e.message, 'background-color:red;color:white;');
        }
    };
    /**
     * Represents updateClock.
     * This will be an instance member, App#updateClock.
     * @memberof App.prototype
     */
    App.prototype.updateClock = function () {
        var now = new Date(),
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            hours = '0' + now.getHours(),
            minutes = '0' + now.getMinutes(),
            time =  hours.slice(-2) + ':' + minutes.slice(-2),
            date = [ months[now.getMonth()], ' ', now.getDate(), ',', now.getFullYear()].join(' '),
            city = [ 'Chicago, IL update ', now.getFullYear(), '.', now.getMonth() + 1, '.', now.getDate(), ' ',  time  ].join(''),
            that = this;

        this.info2.set('headerInfoTime', time);
        this.info2.set('headerInfoDate', date);
        this.info2.set('headerInfoCity', city);

        setTimeout(function () {
            that.updateClock();
        }, 1000);
    };
    /**
     * Represents events Handler.EventListeners were added in handlers method.
     * This will be an instance member, App#handlers.
     * @memberof App.prototype
     */
    App.prototype.handlers = function () {
        var that = this;
        /**
         * JSON file change notification event.
         *
         * @event App#JsonFileChangeEvent
         */
        this.socket.on('notification', function (data, prev, current) {
            console.log(that.jsonFormatter(data, 4));
            that.socket.emit('my other event', { my: 'Json Notification Success' });
        });
        /**
         * DB change notification event.
         *
         * @event App#DbChangeEvent
         */
        /*this.socket.on('dbNotification', function (data) {
            console.log(data);
            if (data.o2 !== undefined) {
                //Object.keys(data.o.$set)[0] returns class name
                //data.o2._id returns id
                //data.o.$set[Object.keys(data.o.$set)[0]] returns the value
                
                var idVal = '#idVal' + data.o2._id,
                    element = '',
                    j = '',
                    len = '',
                    classVal = '',
                    changeVal = '';

                if (data.o.$set !== undefined) {
                    classVal = ' .' + Object.keys(data.o.$set)[0];
                    changeVal = data.o.$set[Object.keys(data.o.$set)[0]];
                    console.group('dataChange');
                    console.log(idVal);
                    console.log(classVal);
                    console.log(changeVal);
                    console.log(document.querySelectorAll(idVal + classVal));
                    console.groupEnd('dataChange');
                    element = document.querySelectorAll(idVal + classVal);
                    len = element.length;
                    for (j = 0;  j < len; j += 1) {
                        if (classVal !== ' .status') {
                            element[j].innerHTML = changeVal;
                        } else {
                            element[j].innerHTML = '<span class=' + capitaliseFirstLetter(changeVal) + '>' + changeVal + '</span>';
                        }
                    }
                } else {
                    console.log('update or delete method');
                    console.log(data.o);
                }
            }
            //push some thing to server
            that.socket.emit('myDb', { update: 'db Notification Success' });
        });*/
    };
    return App;
}());

var appInstance = new ApplicationFive();
appInstance.requestMethod('GET', 'data/data.json');
//appInstance.reqMethod('GET', 'http://10.221.49.104:8989/flights', 'tabLeftData');
appInstance.updateClock();
appInstance.handlers();

/*
    var flightData = '{"airline": " KoreanAir", "flight": "360", "time": "10:00", "destination": "yorkShire", "status": "OnTime", "gate": "A22"}',
    appHeaders = "application/json";
    
    Insert Method:
    appInstance.reqMethod('POST', 'appInstance.apiMethod', undefined' , flightData, headers);
    Update Method:
    appInstance.reqMethod('PUT', 'http://10.221.49.104:8989/flights/54534b203974316c32a527e3','undefined', flightData, headers);
    Delete Method:
    appInstance.reqMethod('DELETE', 'http://10.221.49.104:8989/flights/54535707ca4c1cf42db5553b', 'undefined', flightData, headers); 
*/

