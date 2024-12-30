/*global BindClass: false */
/*jslint browser:true, indent: 4 */

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
    appReload = 8,
    frontDiv = document.getElementById('screenBackrgound');

/**
 * Binds data to HTML Page.
 * @method bindData
 * @param {Object} jsonData - Object contains data to put into HTML
 * @example
 * For Example : 
 * 'jsonData.tagLine' will hold the text/content needs to be set into the html page.
 * For div Tag attribute 'data-bind-appThree', we set value as 'tagLine'(See Below).
 *               
 *     //  div data-bind-appThree = "tagLine"
 *       
 * To set the value from Object to html tag, we need to put the code : 
 *     //  info.set('tagLine', jsonData.tagLine)
 *
 * here, first argument is the name of html tag's attribute value and,
 *             second is the value from javascript Object.
*/
function bindData(jsonData) {
    'use strict';
    /* Data Binding */
    var info = new BindClass('appThree');
    /* First Screen  */
    info.set('tagLine', jsonData.tagline);
    info.set('featureLine', jsonData.featureline);
    info.set('exiciteLine', jsonData.exiciteline);
    info.set('curlImage', jsonData.curlImage);
    info.set('logo', jsonData.logo);
    info.set('brand', jsonData.brand);
    /* Second Screen */
    /* Featured Product */
    info.set('FeaturedProduct', jsonData.FeaturedProduct);
    info.set('FeaturedProductCalorie', jsonData.FeaturedProductCalorie);
    info.set('FeaturedProductType1', jsonData.FeaturedProductType1);
    info.set('FeaturedProductType1Price', jsonData.FeaturedProductType1Price);
    info.set('FeaturedProductType2', jsonData.FeaturedProductType2);
    info.set('FeaturedProductType2Price', jsonData.FeaturedProductType2Price);
    info.set('FeaturedProductType3', jsonData.FeaturedProductType3);
    info.set('FeaturedProductType3Price', jsonData.FeaturedProductType3Price);
    info.set('FeaturedProductType4', jsonData.FeaturedProductType4);
    info.set('FeaturedProductType4Price', jsonData.FeaturedProductType4Price);
    info.set('FeaturedProductDesc1', jsonData.FeaturedProductDesc1);
    info.set('FeaturedProductDesc2', jsonData.FeaturedProductDesc2);
    info.set('FeaturedProductImage', jsonData.FeaturedProductImage);
    /* Featured List */
    /* Item 1 */
    info.set('ListProduct1', jsonData.ListProduct1);
    info.set('ListProduct1Calorie', jsonData.ListProduct1Calorie);
    info.set('ListProduct1Type1', jsonData.ListProduct1Type1);
    info.set('ListProduct1Type1Price', jsonData.ListProduct1Type1Price);
    info.set('ListProduct1Type2', jsonData.FeaturedProductType2);
    info.set('ListProduct1Type2Price', jsonData.ListProduct1Type2Price);
    info.set('ListProduct1Type3', jsonData.ListProduct1Type3);
    info.set('ListProduct1Type3Price', jsonData.ListProduct1Type3Price);
    info.set('ListProduct1Type4', jsonData.ListProduct1Type4);
    info.set('ListProduct1Type4Price', jsonData.ListProduct1Type4Price);
    info.set('ListProduct1Image', jsonData.ListProduct1Image);
    /* Item 2 */
    info.set('ListProduct2', jsonData.ListProduct2);
    info.set('ListProduct2Calorie', jsonData.ListProduct2Calorie);
    info.set('ListProduct2Type1', jsonData.ListProduct2Type1);
    info.set('ListProduct2Type1Price', jsonData.ListProduct2Type1Price);
    info.set('ListProduct2Type2', jsonData.ListProduct2Type2);
    info.set('ListProduct2Type2Price', jsonData.ListProduct2Type2Price);
    info.set('ListProduct2Type3', jsonData.ListProduct2Type3);
    info.set('ListProduct2Type3Price', jsonData.ListProduct2Type3Price);
    info.set('ListProduct2Type4', jsonData.ListProduct2Type4);
    info.set('ListProduct2Type4Price', jsonData.ListProduct2Type4Price);
    info.set('ListProduct2Image', jsonData.ListProduct2Image);
    /* Item 3 */
    info.set('ListProduct3', jsonData.ListProduct3);
    info.set('ListProduct3Calorie', jsonData.ListProduct3Calorie);
    info.set('ListProduct3Type1', jsonData.ListProduct3Type1);
    info.set('ListProduct3Type1Price', jsonData.ListProduct3Type1Price);
    info.set('ListProduct3Type2', jsonData.ListProduct3Type2);
    info.set('ListProduct3Type2Price', jsonData.ListProduct3Type2Price);
    info.set('ListProduct3Type3', jsonData.ListProduct3Type3);
    info.set('ListProduct3Type3Price', jsonData.ListProduct3Type3Price);
    info.set('ListProduct3Type4', jsonData.ListProduct3Type4);
    info.set('ListProduct3Type4Price', jsonData.ListProduct3Type4Price);
    info.set('ListProduct3Image', jsonData.ListProduct3Image);
    /* Item 4 */
    info.set('ListProduct4', jsonData.ListProduct4);
    info.set('ListProduct4Calorie', jsonData.ListProduct4Calorie);
    info.set('ListProduct4Type1', jsonData.ListProduct4Type1);
    info.set('ListProduct4Type1Price', jsonData.ListProduct4Type1Price);
    info.set('ListProduct4Type2', jsonData.ListProduct4Type2);
    info.set('ListProduct4Type2Price', jsonData.ListProduct4Type2Price);
    info.set('ListProduct4Type3', jsonData.ListProduct4Type3);
    info.set('ListProduct4Type3Price', jsonData.ListProduct4Type3Price);
    info.set('ListProduct4Type4', jsonData.ListProduct4Type4);
    info.set('ListProduct4Type4Price', jsonData.ListProduct4Type4Price);
    info.set('ListProduct4Image', jsonData.ListProduct4Image);
    /* Item 5 */
    info.set('ListProduct5', jsonData.ListProduct5);
    info.set('ListProduct5Calorie', jsonData.ListProduct5Calorie);
    info.set('ListProduct5Type1', jsonData.ListProduct5Type1);
    info.set('ListProduct5Type1Price', jsonData.ListProduct5Type1Price);
    info.set('ListProduct5Type2', jsonData.ListProduct5Type2);
    info.set('ListProduct5Type2Price', jsonData.ListProduct5Type2Price);
    info.set('ListProduct5Type3', jsonData.ListProduct5Type3);
    info.set('ListProduct5Type3Price', jsonData.ListProduct5Type3Price);
    info.set('ListProduct5Type4', jsonData.ListProduct5Type4);
    info.set('ListProduct5Type4Price', jsonData.ListProduct5Type4Price);
    info.set('ListProduct5Image', jsonData.ListProduct5Image);
}

/**
 * Represents Ajax Reauest to load JSON Data.
 * @method loadDoc
 * @param {string} method - method of the request.
 * @param {string} url - url of the request.
 */
function loadXMLDoc(method, url) {
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
loadXMLDoc('GET', 'data/data.json');

/* Reload Signage App*/
setTimeout(function () {
    location.reload();
//}, appReload * 1000);
}, appReload * 3000);

/* Fade Effect Class been added to Front Div */
frontDiv.classList.add('fadeEffect');

/* Hiding the Front Div after the fade effect is completed */
setTimeout(function () {
    frontDiv.style.opacity = '0';
    frontDiv.style.zIndex = '0';
}, 4600);
/**
 * Animation End Event Listner for CSS Transition
 * 
 * @event webkitAnimationEnd
 */
frontDiv.addEventListener('webkitAnimationEnd', function (e) {
    if (e.animationName === 'fadeIn') {
        e.target.classList.remove('fadeIn');
    }
    if (e.animationName === 'bounceInRight') {
        e.target.classList.remove('bounceInRight');
    }
});