/*jslint browser:true, indent: 4 */
/*global console, BindClass */

/**
 * @file 'appFour' represents one source of data.
 * Whenever a change occurs in this app, associated data attributes shall be updated.
 * In one page we can have multiple sources like 'appOne' which represents multiple data sources.
 * But everything has to be instantiated using BindClass.
 * 
 * Manages the configuration of this HTML application. 
 * Loads JSON data into application to bind the data to the View(HTML page).
 * @author CSP-1
 */

/** @module ApplicationFour */
var ApplicationFour = (function () {
    'use strict';
    /**
     * @constructor App
     * @property {Object} info Data Binding Object.
     */
    var App = function () {
        this.info = new BindClass('appFour');
    };
     /**
     * Represents a bindingInstance. 
     * Data is bound using the `set()` method to a view (Html page).</br>
     * @example
     * 
     * Example: this.info.set('headerLogoImg', headerData.headerLogo);</br>
     * It updates the bindings which has data attribute `headerLogoImg` in respected View(Html page).
     * This will be an instance member, App#getSetConstructor.
     * @memberof App.prototype
     * @param {Object} dataArray - data to set the bindings.
     */
    App.prototype.getSetConstructor = function (dataArray) {
        var headerData = dataArray.headerInfo,
            menuInfoData = dataArray.menuData;
        //Header Info
        this.info.set('headerBgImg', headerData.headerBG);
        this.info.set('headerLogoImg', headerData.headerLogo);
        this.info.set('headerTitle', headerData.headerTitle);
        this.info.set('headerContent', headerData.headerContent);

        //MenuData firstItem
        this.info.set('firstItemImage', menuInfoData.firstItem.image);
        this.info.set('firstItemTitle', menuInfoData.firstItem.title);
        this.info.set('firstItemextraInfo', menuInfoData.firstItem.extraInfo);
        this.info.set('firstItemItemName', menuInfoData.firstItem.itemName);
        this.info.set('firstItemItemValue', menuInfoData.firstItem.itemValue);
        this.info.set('firstItemOptionName', menuInfoData.firstItem.optionName);
        this.info.set('firstItemOptionValue', menuInfoData.firstItem.optionValue);

        //MenuData SecondItem
        this.info.set('secondItemImage', menuInfoData.secondItem.image);
        this.info.set('secondItemTitle', menuInfoData.secondItem.title);
        this.info.set('secondItemextraInfo', menuInfoData.secondItem.extraInfo);
        this.info.set('secondItemItemName', menuInfoData.secondItem.itemName);
        this.info.set('secondItemItemValue', menuInfoData.secondItem.itemValue);
        this.info.set('secondItemOptionName', menuInfoData.secondItem.optionName);
        this.info.set('secondItemOptionValue', menuInfoData.secondItem.optionValue);

        //MenuData ThirdItem
        this.info.set('thirdItemImage', menuInfoData.thirdItem.image);
        this.info.set('thirdItemTitle', menuInfoData.thirdItem.title);
        this.info.set('thirdItemextraInfo', menuInfoData.thirdItem.extraInfo);
        this.info.set('thirdItemItemName', menuInfoData.thirdItem.itemName);
        this.info.set('thirdItemItemValue', menuInfoData.thirdItem.itemValue);
        this.info.set('thirdItemOptionName', menuInfoData.thirdItem.optionName);
        this.info.set('thirdItemOptionValue', menuInfoData.thirdItem.optionValue);

        //MenuData FourthItem
        this.info.set('fourthItemImage', menuInfoData.fourthItem.image);
        this.info.set('fourthItemTitle', menuInfoData.fourthItem.title);
        this.info.set('fourthItemextraInfo', menuInfoData.fourthItem.extraInfo);
        this.info.set('fourthItemItemName', menuInfoData.fourthItem.itemName);
        this.info.set('fourthItemItemValue', menuInfoData.fourthItem.itemValue);
        this.info.set('fourthItemOptionName', menuInfoData.fourthItem.optionName);
        this.info.set('fourthItemOptionValue', menuInfoData.fourthItem.optionValue);

        //MenuData FifthItem
        this.info.set('fifthItemImage', menuInfoData.fifthItem.image);
        this.info.set('fifthItemTitle', menuInfoData.fifthItem.title);
        this.info.set('fifthItemextraInfo', menuInfoData.fifthItem.extraInfo);
        this.info.set('fifthItemItemName', menuInfoData.fifthItem.itemName);
        this.info.set('fifthItemItemValue', menuInfoData.fifthItem.itemValue);
        this.info.set('fifthItemOptionName', menuInfoData.fifthItem.optionName);
        this.info.set('fifthItemOptionValue', menuInfoData.fifthItem.optionValue);

        //MenuData SixthItem
        this.info.set('sixthItemImage', menuInfoData.sixthItem.image);
        this.info.set('sixthItemTitle', menuInfoData.sixthItem.title);
        this.info.set('sixthItemextraInfo', menuInfoData.sixthItem.extraInfo);
        this.info.set('sixthItemItemName', menuInfoData.sixthItem.itemName);
        this.info.set('sixthItemItemValue', menuInfoData.sixthItem.itemValue);
        this.info.set('sixthItemOptionName', menuInfoData.sixthItem.optionName);
        this.info.set('sixthItemOptionValue', menuInfoData.sixthItem.optionValue);


        //MenuData SeventhItem
        this.info.set('seventhItemImage', menuInfoData.seventhItem.image);
        this.info.set('seventhItemTitle', menuInfoData.seventhItem.title);
        this.info.set('seventhItemextraInfo', menuInfoData.seventhItem.extraInfo);
        this.info.set('seventhItemItemName', menuInfoData.seventhItem.itemName);
        this.info.set('seventhItemItemValue', menuInfoData.seventhItem.itemValue);
        this.info.set('seventhItemOptionName', menuInfoData.seventhItem.optionName);
        this.info.set('seventhItemOptionValue', menuInfoData.seventhItem.optionValue);

        //MenuData EighthItem
        this.info.set('eighthItemImage', menuInfoData.eighthItem.image);
        this.info.set('eighthItemTitle', menuInfoData.eighthItem.title);
        this.info.set('eighthItemextraInfo', menuInfoData.eighthItem.extraInfo);
        this.info.set('eighthItemItemName', menuInfoData.eighthItem.itemName);
        this.info.set('eighthItemItemValue', menuInfoData.eighthItem.itemValue);
        this.info.set('eighthItemOptionName', menuInfoData.eighthItem.optionName);
        this.info.set('eighthItemOptionValue', menuInfoData.eighthItem.optionValue);

        //MenuData NinthItem
        this.info.set('ninthItemImage', menuInfoData.ninthItem.image);
        this.info.set('ninthItemTitle', menuInfoData.ninthItem.title);
        this.info.set('ninthItemextraInfo', menuInfoData.ninthItem.extraInfo);
        this.info.set('ninthItemItemName', menuInfoData.ninthItem.itemName);
        this.info.set('ninthItemItemValue', menuInfoData.ninthItem.itemValue);
        this.info.set('ninthItemOptionName', menuInfoData.ninthItem.optionName);
        this.info.set('ninthItemOptionValue', menuInfoData.ninthItem.optionValue);
    };
    /**
     * Represents a Ajax Request.
     * This will be an instance member, App#reqMethod.
     * @memberof App.prototype
     * @param {string} method - method of the request.
     * @param {string} url - The URL of the request.
     */
    App.prototype.reqMethod = function (method, url) {
        try {
            var req = new XMLHttpRequest(),
                dataset = "",
                that = this;

            req.open(method, url, false);
            req.onload = function () {
                dataset = JSON.parse(req.responseText);
                that.getSetConstructor(dataset);
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

var appInstance = new ApplicationFour();
appInstance.reqMethod('GET', 'data/data.json');