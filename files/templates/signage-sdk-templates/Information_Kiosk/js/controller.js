/*global BindClass: false */
/*jslint browser:true, indent:4 */
/*jshint strict:true */

/**
 * @file Manages the configuration of the HTML application. 
 * Loading the JSON data in application to binding the data into the page.
 * For Routing Concept, please check : http://joakimbeng.eu01.aws.af.cm/a-javascript-router-in-20-lines
 * @author LG CSP-1
 */

/**
 * Description of module, defines module for whole file.
 * @lends module: closureFunction
 * @module closureFunction
 */
(function () {
    'use strict';
    var dataSet, i, info, index,
        imageToggle = {},
        listElements = document.querySelectorAll('.ul a'),
        routes = {},
        views = document.getElementsByClassName('page'),
        imagePopup = document.getElementsByClassName('imagePopup'),
        leftArrow = document.getElementById('leftArrow'),
        rightArrow = document.getElementById('rightArrow'),
        close = document.getElementById('close'),
        modal = document.getElementById('modal'),
        noOfViews = views.length,
        noOfLinks = listElements.length,
        hideViews = function () {
            for (i = 0; i < noOfViews; i += 1) {
                views[i].style.display = 'none';
            }
        },
        removeBgList = function () {
            for (i = 0; i < noOfLinks; i += 1) {
                listElements[i].style.backgroundColor = '#2e2e2e';
            }
        },
        makeClickHandler = function (ele) {
            return function () {
                removeBgList();
                ele.style.backgroundColor = '#393939';
            };
        },
        imagePopupHandler = function (ele) {
            return function () {
                index = ele.id.slice(-2) - 1;
                info.set('imagePopup', imageToggle.productPopupImg[index]);
                info.set('modalProductName', imageToggle.productPopupName[index]);
                info.set('modalProductPrice', imageToggle.productPopupPrice[index]);
				info.set('modalProductSize', imageToggle.productPopupSize[index]);
				info.set('modalDescLine1', imageToggle.productPopupDescLine1[index]);
				info.set('modalDescLine2', imageToggle.productPopupDescLine2[index]);
				info.set('modalDescLine3', imageToggle.productPopupDescLine3[index]);
				
                modal.style.display = 'block';
            };
        };

    for (i = 0; i < noOfLinks; i += 1) {
        listElements[i].addEventListener('click', makeClickHandler(listElements[i]));
    }
    for (i = 0; i < imagePopup.length; i += 1) {
        imagePopup[i].addEventListener('click', imagePopupHandler(imagePopup[i]));
    }
    /* Routing Concepts - http://joakimbeng.eu01.aws.af.cm/a-javascript-router-in-20-lines */
    function route(path, templateId) {
        routes[path] = { templateId: templateId };
    }

    function router() {
        // Current route url (getting rid of '#' in hash as well):
        var url = location.hash.slice(1) || '/page1',
            routeInfo = routes[url],
            template = document.getElementById(routeInfo.templateId);
        if (url === '/page1') {
            window.location.hash = '/page1';
        }
        var urlPath = document.getElementById('menu_' + url.slice(-1));
        urlPath.style.backgroundColor = '#393939';
        if (routeInfo.templateId) {
            // Render route template with John Resig's template engine:
            hideViews();
            template.style.display = 'block';
        }
    }
    //Reg Routes
    route('/page1', 'Page1');
    route('/page2', 'Page2');
    route('/page3', 'Page3');
    route('/page4', 'Page4');
    route('/page5', 'Page5');

    window.addEventListener('load', router);
    window.addEventListener('hashchange', router);
    close.addEventListener('click', function () {
        modal.style.display = 'none';
    });
    close.addEventListener('mousedown', function () {
        info.set('close', imageToggle.closeDark);
    });
    close.addEventListener('mouseup', function () {
        info.set('close', imageToggle.close);
    });

    leftArrow.addEventListener('click', function () {
        if (index <= 0) {
            index = imageToggle.productPopupImgLength - 1;
        } else {
            --index;
        }
        info.set('imagePopup', imageToggle.productPopupImg[index]);
        info.set('modalProductName', imageToggle.productPopupName[index]);
        info.set('modalProductPrice', imageToggle.productPopupPrice[index]);
		info.set('modalProductSize', imageToggle.productPopupSize[index]);
		info.set('modalDescLine1', imageToggle.productPopupDescLine1[index]);
		info.set('modalDescLine2', imageToggle.productPopupDescLine2[index]);
		info.set('modalDescLine3', imageToggle.productPopupDescLine3[index]);
    });
    leftArrow.addEventListener('mousedown', function () {
        info.set('leftArrow', imageToggle.leftArrowDark);
    });
    leftArrow.addEventListener('mouseup', function () {
        info.set('leftArrow', imageToggle.leftArrow);
    });

    rightArrow.addEventListener('click', function () {
        if (index >= imageToggle.productPopupImgLength - 1) {
            index = 0;
        } else {
            ++index;
        }
        info.set('imagePopup', imageToggle.productPopupImg[index]);
        info.set('modalProductName', imageToggle.productPopupName[index]);
        info.set('modalProductPrice', imageToggle.productPopupPrice[index]);
		info.set('modalProductSize', imageToggle.productPopupSize[index]);
		info.set('modalDescLine1', imageToggle.productPopupDescLine1[index]);
		info.set('modalDescLine2', imageToggle.productPopupDescLine2[index]);
		info.set('modalDescLine3', imageToggle.productPopupDescLine3[index]);
    });

    rightArrow.addEventListener('mousedown', function () {
        info.set('rightArrow', imageToggle.rightArrowDark);
    });
    rightArrow.addEventListener('mouseup', function () {
        info.set('rightArrow', imageToggle.rightArrow);
    });
    /**
     * Binds data to HTML Page.
     * @method bindData()
     * @param {Object} jsonData - Object contains data to put into HTML
     * @example
     * For Example : 
     * 'jsonData.logo' will hold the path of the image to be put into the html page.
     * For Img Tag attribute 'data-bind-app', we set value as 'logo'(See Below).
     *               
     *     //  span data-bind-app = "logo"
     *       
     * To set the value from Object to html tag, we need to put the code : 
     *     //  info.set('logo', jsonData.logo)
     *
     * here, first argument is the name of html tag's attribute value and,
     *             second is the value from javascript Object.
    */
    function bindData(jsonData) {
        //Data Binding
        info = new BindClass('app');
        info.set('logo', jsonData.logo);
        info.set('imageOverlayText', jsonData.imageOverlayText);
        info.set('menu_1', jsonData.menu_1);
        info.set('menu_2', jsonData.menu_2);
        info.set('menu_3', jsonData.menu_3);
        info.set('menu_4', jsonData.menu_4);
        info.set('menu_5', jsonData.menu_5);
        info.set('adHeading', jsonData.adHeading);

        info.set('productImg1', jsonData.productImg1);
        info.set('productName1', jsonData.productName1);        
        info.set('productPrice1', jsonData.productPrice1);

        info.set('productImg2', jsonData.productImg2);   
        info.set('productName2', jsonData.productName2);
        info.set('productPrice2', jsonData.productPrice2);

        info.set('productImg3', jsonData.productImg3);      
        info.set('productName3', jsonData.productName3);
        info.set('productPrice3', jsonData.productPrice3);

        info.set('productImg4', jsonData.productImg4);      
        info.set('productName4', jsonData.productName4);
        info.set('productPrice4', jsonData.productPrice4);

        info.set('productImg5', jsonData.productImg5);      
        info.set('productName5', jsonData.productName5);
        info.set('productPrice5', jsonData.productPrice5);

        info.set('productImg6', jsonData.productImg6);    
        info.set('productName6', jsonData.productName6);
        info.set('productPrice6', jsonData.productPrice6);

        info.set('productImg7', jsonData.productImg7);      
        info.set('productName7', jsonData.productName7);
        info.set('productPrice7', jsonData.productPrice7);

        info.set('productImg8', jsonData.productImg8);       
        info.set('productName8', jsonData.productName8);
        info.set('productPrice8', jsonData.productPrice8);

        info.set('productImg9', jsonData.productImg9);     
        info.set('productName9', jsonData.productName9);
        info.set('productPrice9', jsonData.productPrice9);

        info.set('productImg10', jsonData.productImg10);          
        info.set('productName10', jsonData.productName10);
        info.set('productPrice10', jsonData.productPrice10);

        info.set('productImg11', jsonData.productImg11);      
        info.set('productName11', jsonData.productName11);
        info.set('productPrice11', jsonData.productPrice11);

        info.set('productImg12', jsonData.productImg12);           
        info.set('productName12', jsonData.productName12);
        info.set('productPrice12', jsonData.productPrice12);  

        info.set('bannerBackground', jsonData.bannerBackground);
        info.set('Screen2Heading', jsonData.Screen2Heading);     
        info.set('screen3SideImage', jsonData.screen3SideImage);

        info.set('screen3ProductImg1', jsonData.screen3ProductImg1);
        info.set('screen3ProductName1', jsonData.screen3ProductName1);
        info.set('screen3ProductPrice1', jsonData.screen3ProductPrice1);

        info.set('screen3ProductImg2', jsonData.screen3ProductImg2);
        info.set('screen3ProductName2', jsonData.screen3ProductName2);
        info.set('screen3ProductPrice2', jsonData.screen3ProductPrice2);   

        info.set('screen3ProductImg3', jsonData.screen3ProductImg3);
        info.set('screen3ProductName3', jsonData.screen3ProductName3);
        info.set('screen3ProductPrice3', jsonData.screen3ProductPrice3);   

        info.set('screen3ProductImg4', jsonData.screen3ProductImg4);
        info.set('screen3ProductName4', jsonData.screen3ProductName4);
        info.set('screen3ProductPrice4', jsonData.screen3ProductPrice4);   

        info.set('screen3ProductImg5', jsonData.screen3ProductImg5);
        info.set('screen3ProductName5', jsonData.screen3ProductName5);
        info.set('screen3ProductPrice5', jsonData.screen3ProductPrice5);   

        info.set('screen3ProductImg6', jsonData.screen3ProductImg6);
        info.set('screen3ProductName6', jsonData.screen3ProductName6);
        info.set('screen3ProductPrice6', jsonData.screen3ProductPrice6);   

        info.set('close', jsonData.close);
        info.set('leftArrow', jsonData.leftArrow);
        info.set('rightArrow', jsonData.rightArrow);
        info.set('blockHeading_1', jsonData.blockHeading_1);
        info.set('timing', jsonData.timing);
        info.set('subject', jsonData.subject);
        info.set('address', jsonData.address);
        info.set('location', jsonData.location);
        info.set('phone', jsonData.phone);
		
		info.set('Screen4blockHeading_1', jsonData.Screen4blockHeading_1);
        info.set('Screen4timing1', jsonData.Screen4timing1);
        info.set('Screen4subject1', jsonData.Screen4subject1);
        info.set('Screen4address1', jsonData.Screen4address1);
        info.set('Screen4location1', jsonData.Screen4location1);
        info.set('Screen4phone1', jsonData.Screen4phone1);
        info.set('Screen4timing2', jsonData.Screen4timing2);
        info.set('Screen4subject2', jsonData.Screen4subject2);
        info.set('Screen4address2', jsonData.Screen4address2);
        info.set('Screen4location2', jsonData.Screen4location2);
        info.set('Screen4phone2', jsonData.Screen4phone2);
        info.set('Screen4timing3', jsonData.Screen4timing3);
        info.set('Screen4subject3', jsonData.Screen4subject3);
        info.set('Screen4address3', jsonData.Screen4address3);
        info.set('Screen4location3', jsonData.Screen4location3);
        info.set('Screen4phone3', jsonData.Screen4phone3);

        info.set('Screen4blockHeading_2', jsonData.Screen4blockHeading_2);
        info.set('Screen4timing4', jsonData.Screen4timing4);
        info.set('Screen4subject4', jsonData.Screen4subject4);
        info.set('Screen4address4', jsonData.Screen4address4);
        info.set('Screen4location4', jsonData.Screen4location4);
        info.set('Screen4phone4', jsonData.Screen4phone4);
        info.set('Screen4timing5', jsonData.Screen4timing5);
        info.set('Screen4subject5', jsonData.Screen4subject5);
        info.set('Screen4address5', jsonData.Screen4address55);
        info.set('Screen4location5', jsonData.Screen4location5);
        info.set('Screen4phone5', jsonData.Screen4phone5);
        info.set('Screen4timing6', jsonData.Screen4timing6);
        info.set('Screen4subject6', jsonData.Screen4subject6);
        info.set('Screen4address6', jsonData.Screen4address6);
        info.set('Screen4location6', jsonData.Screen4location6);
        info.set('Screen4phone6', jsonData.Screen4phone6);

        info.set('section_Line1', jsonData.section_Line1);
        info.set('section_Line2', jsonData.section_Line2);
        info.set('section_Line3', jsonData.section_Line3);
        info.set('section_Line4', jsonData.section_Line4);
        info.set('section_Line5', jsonData.section_Line5);
        info.set('section_Line6', jsonData.section_Line6);
        info.set('section_Line7', jsonData.section_Line7);
        info.set('blockHeading_2', jsonData.blockHeading_2);
        info.set('blockHeading_3', jsonData.blockHeading_3);
		info.set('blockHeading_4', jsonData.blockHeading_4);
        info.set('subHeading', jsonData.subHeading);

        info.set('address1', jsonData.address1);
        info.set('location1', jsonData.location1);
        info.set('phone1', jsonData.phone1);
        info.set('address2', jsonData.address2);
        info.set('location2', jsonData.location2);
        info.set('phone2', jsonData.phone2);
        info.set('address3', jsonData.address3);
        info.set('location3', jsonData.location3);
        info.set('phone3', jsonData.phone3);
        info.set('address4', jsonData.address4);
        info.set('location4', jsonData.location4);
        info.set('phone4', jsonData.phone4);
        info.set('address5', jsonData.address5);
        info.set('location5', jsonData.location5);
        info.set('phone5', jsonData.phone5);

        info.set('newTag', jsonData.newTag);
        info.set('image', jsonData.image);
        info.set('modalProductName', jsonData.modalProductName);
        info.set('modalProductPrice', jsonData.modalProductPrice);

        imageToggle.close = jsonData.close;
        imageToggle.closeDark = jsonData.closeDark;
        imageToggle.rotation = jsonData.rotation;
        imageToggle.rotationDark = jsonData.rotationDark;
        imageToggle.leftArrow = jsonData.leftArrow;
        imageToggle.leftArrowDark = jsonData.leftArrowDark;
        imageToggle.rightArrow = jsonData.rightArrow;
        imageToggle.rightArrowDark = jsonData.rightArrowDark;

        imageToggle.productPopupImg = jsonData.productPopupImg;
        imageToggle.productPopupImgLength = jsonData.productPopupImg.length;

        imageToggle.productPopupName = jsonData.productPopupName;
        imageToggle.productPopupPrice = jsonData.productPopupPrice;
		imageToggle.productPopupSize = jsonData.productPopupSize;
		
		imageToggle.productPopupDescLine1 = jsonData.productPopupDescLine1;
		imageToggle.productPopupDescLine2 = jsonData.productPopupDescLine2;
		imageToggle.productPopupDescLine3 = jsonData.productPopupDescLine3;
    }
    /**
     * Represents Ajax Reauest to load JSON Data.
     * @method loadDoc()
     * @param {string} method - method of the request.
     * @param {string} url - url of the request.
     */
    function loadDoc(method, url) {
        var req = new XMLHttpRequest();
        req.open(method, url);
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
}());