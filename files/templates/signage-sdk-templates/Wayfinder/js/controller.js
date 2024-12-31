/*jslint browser: true, indent: 4 */
/*global  console, BindClass, requestAnimationFrame */

/**
 * @file Manages the configuration of the HTML application. 
 * Loads JSON data into application to bind the data to the View(HTML page).
 * @author CSP-1
 */

/** @module ApplicationEleven */
var ApplicationEleven = (function () {
    'use strict';
    /**
     * @constructor App
     * @property {Object} info Sets Data Binding Object.
     * @property {Object} routes contains hash maps of urls.
     */
    var App = function () {
        this.info = new BindClass('appEleven');
        this.routes = {};
        this.floorMaps = document.querySelectorAll('.floorMap div');
        this.floorMap = document.getElementsByClassName('floorMap')[0];
        this.sfInf = document.getElementsByClassName('secondFloor')[0];
        this.ufInf = document.getElementsByClassName('upperFloor')[0];
        this.lfInf = document.getElementsByClassName('lowerFloor')[0];
        this.mapHolder = document.getElementsByClassName('mapHolder')[0];
        this.flrWoS = document.getElementsByClassName('floorWOS');
        this.listIcons = document.getElementsByClassName('listIcons')[0];
        this.selMapHolder = document.getElementsByClassName('selMapHolder');
        this.selectedMapDesc = document.getElementsByClassName('selectedMapDesc');
        this.floorLabels = document.getElementsByClassName('floorLbl');
        this.popUpBlk = document.getElementById('popUp');
        this.backBtn = document.getElementById('backBtn');
        this.sfDir = document.getElementById('sfDir');
        this.ufDir = document.getElementById('ufDir');
        this.lfDir = document.getElementById('lfDir');
        this.prevHash = location.hash.slice(1) || '/';
        this.prsHash = location.hash.slice(1) || '/';
        this.frEach = Array.prototype.forEach;
        this.storeInfo = {};
        this.routes = [];
        this.homePage = false;
    };
    /**
     * Represents hide view elements.
     * This will be an instance member, App#hideViews.
     * @memberof App.prototype
     * @param {Object} viewElement - which element has to be hide.
     */
    App.prototype.hideViews = function (viewElement) {
        viewElement.style.display = 'none';
        viewElement.style.opacity = 0;
    };
    /**
     * Represents a hiding popup.
     * This will be an instance member, App#hidePopUp.
     * @memberof App.prototype
     */
    App.prototype.hidePopUp = function () {
        this.popUpBlk.style.display = 'none';
    };
    /**
     * Represents adding url routes.
     * This will be an instance member, App#route.
     * @memberof App.prototype
     * @param {string} path - which has to be added to route.
     * @param {Object} templateId - template information of corresponding route.
     * @param {Object} controllerId - controller information of corresponding route.
     */
    App.prototype.route = function (path, templateId, controllerId) {
        this.routes[path] = {
            templateId: templateId,
            controllerId: controllerId
        };
    };
    /**
     * Represents a making a call to controller based on which route has been loaded.
     * This will be an instance member, App#router.
     * @memberof App.prototype
     */
    App.prototype.router = function () {
        var url = location.hash.slice(1) || '/',
            routeInfo = this.routes[url];

        if (routeInfo.controllerId !== undefined) {
            routeInfo.controllerId();
        }
    };
    /**
     * Represents pre loading Images.
     * This will be an instance member, App#preLoadImages.
     * @memberof App.prototype
     */
    App.prototype.preLoadImages = function () {
        var that = this;
        this.preload = [];
        this.frEach.call(arguments, function (e, i) {
            that.preload[i] = new Image();
            that.preload[i].src = e;
        });
    };

    /**
     * Represents events Handler.EventListeners were added in handlers method.
     * This will be an instance member, App#handlers.
     * @memberof App.prototype
     */
    App.prototype.handlers = function () {
        var that = this;
        /**
         * hashChange event.
         *
         * @event App#hashChangeEvent
         */
        window.addEventListener('hashchange', function () {
            that.router();
        });
        /**
         * popUp click event.
         *
         * @event App#popUpClickEvent
         */
        this.popUpBlk.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.display = 'block';
        });
        /**
         * body click event.
         *
         * @event App#bodyClickEvent
         */
        window.addEventListener('click', function () {
            that.hidePopUp();
        }, true);
        /**
         * Back Button click event.
         *
         * @event App#mapClickEvent
         */
        this.backBtn.addEventListener('click', function () {
            var zInd = [4, 3, 1];
            that.frEach.call(that.flrWoS, function (ele, ind) {
                ele.style.zIndex = zInd[ind];
            });
            that.homepageLoader();
        });
        /**
         * Floor change event.
         *
         * @event App#FloorChangeEvent
         */
        this.frEach.call(this.floorMaps, function (el) {
            el.addEventListener('click', function () {
                var zInd = [];
                switch (el.id) {
                case 'secondFloor':
                    zInd = [4, 0, 0];
                    break;
                case 'upperFloor':
                    zInd = [0, 3, 0];
                    break;
                case 'lowerFloor':
                    zInd = [0, 0, 1];
                    break;
                default:
                    console.log('prevHash:' + that.prevHash + 'prsHash' + that.prsHash);
                    break;
                }
                that.prevHash = location.hash.slice(1);
                that.prsHash = el.id;
                window.location.hash = that.prsHash;
                that.frEach.call(that.flrWoS, function (ele, ind) {
                    ele.style.zIndex = zInd[ind];
                });
            });
        });
        /**
         * Floor Labels Change Event.
         *
         * @event App#FloorLabelsChangeEvent
         */
        this.frEach.call(this.floorLabels, function (el) {
            el.addEventListener('click', function (e) {
                that.popUp(e.srcElement.innerHTML);
            });
        });
    };
    /**
     * Represents different floor routes loader.
     * This will be an instance member, App#floorLoader.
     * @memberof App.prototype
     */
    App.prototype.floorLoader = function (temp) {
        var tempTemplate = document.getElementById(temp),
            locationPointer = document.querySelector('#' + temp + ' .selMapHolder .locIcon'),
            shadowPointer = document.querySelector('#' + temp + ' .selMapHolder .shadowIcon'),
            that = this;

        this.frEach.call(this.selMapHolder, this.hideViews);
        this.frEach.call(this.selectedMapDesc, this.hideViews);

        this.backBtn.style.opacity = 1;

        this.sfDir.classList.remove('fdRgtIn');
        this.sfInf.classList.remove('fdLftIn');
        this.ufDir.classList.remove('fdRgtIn');
        this.ufInf.classList.remove('fdLftIn');
        this.lfDir.classList.remove('fdRgtIn');
        this.lfInf.classList.remove('fdLftIn');
        this.mapHolder.classList.remove('mapHolderAct');
        this.floorMap.classList.remove('mapHolderAct');

        requestAnimationFrame(function () {
            that.sfDir.classList.add('fdRgtOut');
            that.sfInf.classList.add('fdLftOut');
            that.mapHolder.classList.add('mapHolderScale');
            that.floorMap.classList.add('mapHolderScale');
            that.ufDir.classList.add('fdRgtOut');
            that.ufInf.classList.add('fdLftOut');
            that.lfDir.classList.add('fdRgtOut');
            that.lfInf.classList.add('fdLftOut');
        });

        tempTemplate.children[0].classList.remove('selMapShow');
        tempTemplate.children[1].classList.remove('activeMapDesc');
        tempTemplate.children[0].style.display = "block";
        tempTemplate.children[1].style.display = "block";
        locationPointer.classList.remove('bounce');
        shadowPointer.classList.remove('simpleScale');

        requestAnimationFrame(function () {
            that.listIcons.style.WebkitAnimation = 'show 1s';
            that.listIcons.style.opacity = 1;
            tempTemplate.children[0].classList.add('selMapShow');
            tempTemplate.children[1].classList.add('activeMapDesc');
            tempTemplate.children[0].style.opacity = 1;
            tempTemplate.children[1].style.opacity = 1;
        });

        setTimeout(function () {
            if (that.prsHash === that.info.get('floorFlag')) {
                locationPointer.classList.add('bounce');
                shadowPointer.classList.add('simpleScale');
            }
        }, 1000);

        if (!this.homePage) {
            this.homePage = true;
        }
    };
    /**
     * Represents home Page loader.
     * This will be an instance member, App#homepageLoader.
     * @memberof App.prototype
     */
    App.prototype.homepageLoader = function () {
        if (this.homePage) {

            var that = this;

            this.backBtn.style.opacity = 0;
            this.listIcons.style.opacity = 0;

            this.ufDir.style.opacity = 0;
            this.ufInf.style.opacity = 0;
            this.lfDir.style.opacity = 0;
            this.lfInf.style.opacity = 0;

            this.frEach.call(this.selMapHolder, this.hideViews);
            this.frEach.call(this.selectedMapDesc, this.hideViews);

            this.sfDir.classList.remove('fdRgtOut');
            this.sfInf.classList.remove('fdLftOut');
            this.ufDir.classList.remove('fdRgtOut');
            this.ufInf.classList.remove('fdLftOut');
            this.lfDir.classList.remove('fdRgtOut');
            this.lfInf.classList.remove('fdLftOut');
            this.mapHolder.classList.remove('mapHolderScale');
            this.floorMap.classList.remove('mapHolderScale');

            requestAnimationFrame(function () {
                that.sfDir.classList.add('fdRgtIn');
                that.sfInf.classList.add('fdLftIn');
                that.ufInf.classList.add('fdLftIn');
                that.lfInf.classList.add('fdLftIn');
                that.mapHolder.classList.add('mapHolderAct');
                that.floorMap.classList.add('mapHolderAct');
                that.ufDir.classList.add('fdRgtIn');
                that.lfDir.classList.add('fdRgtIn');
            });

            this.listIcons.style.WebkitAnimation = 'hide 1s';

            this.prevHash = location.hash.slice(1);
            this.prsHash = '/';
            window.location.hash = this.prsHash;
        }

        if (!this.homePage) {
            this.homePage = true;
        }
    };
    /**
     * Represents routes inialisation.
     * This will be an instance member, App#routerInit.
     * @memberof App.prototype
     * @param {Object} commonSettings - common settings.
     * @param {Object} hmPageStngs - home page settings.
     * @param {Object} sfStngs - second floor settings.
     * @param {Object} ufStngs - upper floor settings.
     * @param {Object} lfStngs - lower floor settings.
     */
    App.prototype.routerInit = function (commonSettings, hmPageStngs, sfStngs, ufStngs, lfStngs) {
        var that = this,
            imagePreload = [hmPageStngs.floorMap1,
                            hmPageStngs.floorMap2,
                            hmPageStngs.floorMap3,
                            hmPageStngs.floorMap1Shadow,
                            hmPageStngs.floorMap2Shadow,
                            hmPageStngs.floorMap3Shadow,
                            hmPageStngs.floorMapShadow,
                            sfStngs.FloorMap3,
                            ufStngs.FloorMap2,
                            lfStngs.FloorMap1,
                            commonSettings.location];

        this.preLoadImages.apply(this, imagePreload);

        this.info.set('floorFlag', commonSettings.floor);
        this.info.set('logoImg', commonSettings.logo);
        this.info.set('bkBtnImg', commonSettings.backButton);
        this.info.set('locationImg', commonSettings.location);
        this.info.set('shadowImg', commonSettings.shadowIcon);
        this.info.set('actBtn', commonSettings.popUp.activeBtn);
        this.info.set('nActBtn', commonSettings.popUp.nonActiveBtn);

        this.info.set('parkingIcon', commonSettings.parkingIcon);
        this.info.set('InfoIcon', commonSettings.infoIcon);
        this.info.set('elevatorIcon', commonSettings.elevatorIcon);
        this.info.set('escalatorIcon', commonSettings.escalatorIcon);
        this.info.set('toiletIcon', commonSettings.toiletIcon);
        this.info.set('exitIcon', commonSettings.exitIcon);

        this.info.set('parkingIconTxt', commonSettings.parkingIconTxt);
        this.info.set('InfoIconTxt', commonSettings.infoIconTxt);
        this.info.set('elevatorIconTxt', commonSettings.elevatorIconTxt);
        this.info.set('escalatorIconTxt', commonSettings.escalatorIconTxt);
        this.info.set('toiletIconTxt', commonSettings.toiletIconTxt);
        this.info.set('exitIconTxt', commonSettings.exitIconTxt);

        this.info.set('sfTitle', commonSettings.FloorTitle3);
        this.info.set('ufTitle', commonSettings.FloorTitle2);
        this.info.set('lfTitle', commonSettings.FloorTitle1);

        this.info.set('sfStabData', commonSettings.FlrTabData3);  
        this.info.set('ufStabData', commonSettings.FlrTabData2);
        this.info.set('lfStabData', commonSettings.FlrTabData1);
		

        //template1
        this.info.set('floorMapShadow', hmPageStngs.floorMapShadow);
        this.info.set('floorMapOne', hmPageStngs.floorMap1);
        this.info.set('floorMapOneShadow', hmPageStngs.floorMap1Shadow);
        this.info.set('floorMapTwo', hmPageStngs.floorMap2);
        this.info.set('floorMapTwoShadow', hmPageStngs.floorMap2Shadow);
        this.info.set('floorMapThree', hmPageStngs.floorMap3);
        this.info.set('floorMapThreeShadow', hmPageStngs.floorMap3Shadow);
        this.info.set('sfName', hmPageStngs.FloorName3);
        this.info.set('ufName', hmPageStngs.FloorName2);
        this.info.set('lfName', hmPageStngs.FloorName1);
        this.info.set('sfTable', hmPageStngs.FloorDirectory3);
        this.info.set('ufTable', hmPageStngs.FloorDirectory2);
        this.info.set('lfTable', hmPageStngs.FloorDirectory1);
        this.info.set('dr', hmPageStngs.directory);

        //template2
        this.info.set('sfMap', sfStngs.FloorMap3);

        //template3
        this.info.set('ufMap', ufStngs.FloorMap2);

        //template4
        this.info.set('lfMap', lfStngs.FloorMap1);

        this.route('/', 'template1', function () {
            that.homepageLoader();
        });

        this.route('secondFloor', 'template2', function () {
            that.floorLoader('template2');
        });
        this.route('upperFloor', 'template3', function () {
            that.floorLoader('template3');
        });
        this.route('lowerFloor', 'template4', function () {
            that.floorLoader('template4');
        });

        this.handlers();
        this.router();
    };
    /**
     * Represents popUp show.
     * This will be an instance member, App#popUp.
     * @memberof App.prototype
     * @param {number} shopNumber - shop number.
     */
    App.prototype.popUp = function (shopNumber) {
        this.popUpBlk.style.display = 'block';
        console.log(this.storeInfo[shopNumber]);
        this.info.set('shopLogo', this.storeInfo[shopNumber].logo);
        this.info.set('shopName', this.storeInfo[shopNumber].shopName);
        this.info.set('shopDesc', this.storeInfo[shopNumber].shopDesc);
    };
    /**
     * Represents a Ajax Reauest.
     * This will be an instance member, App#reqMethod.
     * @memberof App.prototype
     * @param {string} method - method of the request.
     * @param {string} url - url of the request.
     */
    App.prototype.reqMethod = function (method, url) {
        try {
            var req = new XMLHttpRequest(),
                dataset = {},
                that = this;

            req.open(method, url, false);
            req.onload = function () {
                dataset = JSON.parse(req.responseText);
                that.storeInfo = dataset.storeInfo;
                that.routerInit(dataset.commonSettings, dataset.homePage, dataset.Floor3, dataset.Floor2, dataset.Floor1);
            };
            req.onerror = function () {
                throw 'Cannot load file ' + url;
            };
            req.send();
        } catch (e) {
            console.log('%c Error: Issue in js/controller.js/reqMethod -- ' + e.message, 'background-color:red;color:white;');
        }
    };
    return App;
}());

var appInstance = new ApplicationEleven();
appInstance.reqMethod('GET', 'data/data.json');