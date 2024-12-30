/*global BindClass: false */
/*jslint browser:true, indent:4 */

/**
 * @file Manages the configuration of the HTML application.
 * Loading the JSON data in application to binding the data into the page.
 * @author LG CSP-1
 */
var dataSet,
/**
 * Timer to reload the Application in seconds
 *  @default
 */
    appReload = 10;

/**
 * Binds data to HTML Page.
 * @method bindData
 * @param {Object} jsonData - Object contains data to put into HTML
 * @example
 * For Example : 
 * 'jsonData.bannerBackground' will hold the path of an image to be set into the html page.
 * For Img Tag attribute 'data-bind-appNine', we set value as 'bannerBackground'(See Below).
 *               
 *     //  img data-bind-appNine = "bannerBackground"
 *       
 * To set the value from Object to html tag, we need to put the code : 
 *     //  info.set('bannerBackground', jsonData.bannerBackground)
 *
 * here, first argument is the name of html tag's attribute value and,
 *             second is the value from javascript Object.
*/
function bindData(jsonData) {
    'use strict';
    /* Data Binding */
    var info = new BindClass('appNine');
    /* First Screen Background */
    info.set('bannerBackground', jsonData.bannerBackground);
    /* Second Screen */
    /* logo and banner */
    info.set('bannerIcon', jsonData.bannerIcon);
    info.set('banner', jsonData.banner);
    /* Ad-Text */
    info.set('bannerAdTextLine1', jsonData.bannerAdTextLine1);
    info.set('bannerAdTextLine2', jsonData.bannerAdTextLine2);
    info.set('bannerAdvertisementLine1', jsonData.bannerAdvertisementLine1);
    info.set('bannerAdvertisementLine2', jsonData.bannerAdvertisementLine2);
    info.set('bannerAdvertisementLine3', jsonData.bannerAdvertisementLine3);
    /* Advertisement-1 */
    info.set('adBanner1Offer', jsonData.adBanner1Offer);
    info.set('adBanner1Name', jsonData.adBanner1Name);
    info.set('adBanner1Desc', jsonData.adBanner1Desc);
    info.set('adBanner1Price', jsonData.adBanner1Price);
    info.set('adImage1', jsonData.adImage1);
    /* Advertisement-2 */
    info.set('adBanner2Offer', jsonData.adBanner2Offer);
    info.set('adBanner2Name', jsonData.adBanner2Name);
    info.set('adBanner2Desc', jsonData.adBanner2Desc);
    info.set('adBanner2Price', jsonData.adBanner2Price);
    info.set('adImage2', jsonData.adImage2);
    /* Advertisement-3 */
    info.set('adBanner3Offer', jsonData.adBanner3Offer);
    info.set('adBanner3Name', jsonData.adBanner3Name);
    info.set('adBanner3Desc', jsonData.adBanner3Desc);
    info.set('adBanner3Price', jsonData.adBanner3Price);
    info.set('adImage3', jsonData.adImage3);
    /* Advertisement-4 */
    info.set('adBanner4Offer', jsonData.adBanner4Offer);
    info.set('adBanner4Name', jsonData.adBanner4Name);
    info.set('adBanner4Desc', jsonData.adBanner4Desc);
    info.set('adBanner4Price', jsonData.adBanner4Price);
    info.set('adImage4', jsonData.adImage4);
}
/**
 * Represents Ajax Reauest to load JSON Data.
 * @method loadDoc
 * @param {string} method - method of the request.
 * @param {string} url - url of the request.
 */
function loadDoc(method, url) {
    'use strict';
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

/* Reload Signage App*/
(function () {
    'use strict';
    setTimeout(function () {
        window.location.reload();
    }, appReload * 1000);
}());
