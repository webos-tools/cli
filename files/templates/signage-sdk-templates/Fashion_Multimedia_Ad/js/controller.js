/*jslint browser:true, indent: 4 */
/*global console, BindClass, requestAnimationFrame */

/**
 * @file 'appOne' represents one source of data.
 * When ever the changes happen in appOne, data attributes which uses appOne has to be updated.
 * In one page we can have multiple sources like 'appOne' which represents multiple data sources.
 * but everything has to be instantiated using BindClass.
 * 
 * Manages the configuration of the HTML application. 
 * Loads JSON data into application to bind the data to the View(HTML page).
 * @author CSP-1
 */

/** @module ApplicationOne */
var status = "NOT RUN YET";
var videoDuration = -1;
var ApplicationOne = (function () {
    'use strict';
    /**
     * @constructor App
     * @property {Object} info Data Binding Object.
     */
    var App = function () {
        this.info = new BindClass('appOne');
        this.curtainTopTrigger = document.getElementById('topPart');
        this.logoTrigger = document.getElementById('logo');
        this.curtainBottomTrigger = document.getElementById('bottomPart');
        this.videoPlayer = document.getElementById('videoPlayer');
        this.lblBtm = document.getElementById('lblBtm');
        this.lblTop = document.getElementById('lblTop');
        this.hrSlide = document.getElementById('hrSlide');
        this.btmContentWrapper = document.getElementById('btmContentWrapper');
        this.authorSign = document.getElementById('authorSign');
        this.authorContent = document.getElementById('authorContent');
    };
    /**
     * Represents a bindingInstance.
     * data will be binded using set methods to View(Html page).</br>
     * @example
     * Example,
     *  this.info.set('video', dataArray.videoPath);
     * It updates the bindings which has data attribute 'video' in respected View(Html page).
     * This will be an instance member, App#getSetConstructor.
     * @memberof App.prototype
     * @param {Object} dataArray - data to set the bindings.
     */
    App.prototype.getSetConstructor = function (dataArray) {
        this.info.set('video', dataArray.videoPath);
        this.info.set('logoImg', dataArray.logoImgPath);
        this.info.set('authorImg', dataArray.authorImgPath);
        this.info.set('lblTop', dataArray.lblTop);
        this.info.set('lblBtm', dataArray.lblBottom);
        this.info.set('authorContent', dataArray.authorContentData);
        this.info.set('title', dataArray.title);
        this.info.set('animTime', dataArray.AnimTime);
        this.handlers();
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
    /**
     * Represents a animation Class Add and remove Handler.
     * This will be an instance member, App#animationClassHandler.
     * @memberof App.prototype
     * @param {object} element - which has to be animated.
     * @param {string} className - animation  class.
     */
    App.prototype.animationClassHandler = function (element, className) {
        if (element.classList.contains(className)) {

            element.classList.remove(className);
            setTimeout(function () {
                element.classList.add(className);
            }, 1);

        } else {
            element.classList.add(className);
        }
    };
    /**
     * Represents events Handler.EventListeners were added in handlers method.
     * This will be an instance member, App#handlers.
     * @memberof App.prototype
     */
    App.prototype.handlers = function () {
        try {
        	//////////////////////////////////
        	setInterval(function() {
        		
        		console.log("### Video Interval - appStatus : " + status + "  Video Ended : " + document.getElementById("videoPlayer").ended + "   "
            	 + " Video Time : " + document.getElementById("videoPlayer").currentTime + " / " + document.getElementById("videoPlayer").duration + " ###");
        		if ( (status === "VIDEO START") || ( (status === "VIDEO PLAYING") && (document.getElementById("videoPlayer").currentTime == 0)) ){
        			
					setTimeout(function() {
						status = "VIDEO PLAYING";
						document.getElementById("videoPlayer").play();
					}, 800);
        		}
        		// Video End
        		if ((status === "VIDEO PLAYING") && document.getElementById("videoPlayer").ended) {//(document.getElementById("videoPlayer").duration === document.getElementById("videoPlayer").currentTime)) {
        			status = "VIDEO END";
        			console.log('###========== Video End ==========###');    			
        			/*
        			
        			setTimeout(function() {
            			console.log('###========== Video 200 ==========###');
            			document.getElementById("videoPlayer").currentTime = 0;
        				document.getElementById("videoPlayer").play();
        			}, 200);
        			setTimeout(function() {
            			console.log('###========== Video 400 ==========###');
        				document.getElementById("videoPlayer").pause();
        			}, 400);
        			*/
        			
                	setTimeout(function() {
                		console.log("### VIDEO END ANIMATION : 1000 ###");
	                    requestAnimationFrame(curtainTopAnimRep);
	                    requestAnimationFrame(curtainBtmAnimRep);
	                    that.btmContentWrapper.style.opacity = 0;
                	}, 1000);
                	
        		} 
        		if ((status === "VIDEO PLAYING") && document.getElementById("videoPlayer").currentTime === 0) {
        			console.log("###############################################################################");
        			console.log("###############################################################################");
        			console.log("##                      VIDEO FREEZE                                         ##");
        			console.log("###############################################################################");
        			console.log("###############################################################################");
        			
        			document.getElementById("videoPlayer").play();
        		}
        	}, 200);
        	
        	// ////////////////////////////////
            var that = this,
                logoAnim = function () {
            	//	console.log('### logoAnim Start ###');
                    that.logoTrigger.style.WebkitAnimation = 'adLogoScale 1.5s';
                    that.logoTrigger.style.WebkitTransform = 'scale(0.68, 0.68)';
            	//	console.log('### logoAnim End ###');
                },
                curtainTopAnim = function () {
            	//	console.log('### curtainTopAnim Start ###');
                    that.curtainTopTrigger.classList.remove('curtainTopAnimRep');
                    that.curtainTopTrigger.classList.add('curtainTopAnim');
            	//	console.log('### curtainTopAnim End ###');
                },
                curtainBtmAnim = function () {
            	//	console.log('### curtainBtmAnim Start ###');
                    that.curtainBottomTrigger.style.WebkitAnimation = 'btmCurtain 1.8s';
                    that.curtainBottomTrigger.style.WebkitTransform = 'translate3d(0,226px,0)';
            	//	console.log('### curtainBtmAnim End ###');
                },
                curtainTopAnimRep = function () {
            	//	console.log('### logoAnim Start ###');
                    that.curtainTopTrigger.classList.remove('curtainTopAnim');
                    that.curtainTopTrigger.classList.add('curtainTopAnimRep');
            	//	console.log('### logoAnim End ###');
                },
                curtainBtmAnimRep = function () {
            	//	console.log('### curtainBtmAnimRep Start ###');
                    that.curtainBottomTrigger.style.WebkitAnimation = 'btmCurtainRep 1.8s';
                    that.curtainBottomTrigger.style.WebkitTransform = 'translate3d(0,0,0)';
            	//	console.log('### curtainBtmAnimRep End ###');
                },
                logoAnimRep = function () {
            	//	console.log('### logoAnimRep Start ###');
                    that.logoTrigger.style.WebkitAnimation = 'adLogoScaleRep  4s';
                    that.logoTrigger.style.WebkitTransform = 'scale(1, 1)';
            	//	console.log('### logoAnimRep End ###');
                };
            requestAnimationFrame(logoAnim);
            /**
             * logo Animation End event.
             *
             * @event App#LogoAnimationEnd
             * @param {object} e - animation Information.
             */
            this.logoTrigger.addEventListener('webkitAnimationEnd', function (anim) {
                switch (anim.animationName) {
                case 'adLogoScale':

            	//	console.log('### adLogoScale Start ###');
                    requestAnimationFrame(curtainTopAnim);
                    requestAnimationFrame(curtainBtmAnim);
                    status = "VIDEO START";
            	//	console.log('### adLogoScale End ###');
                    break;
                case 'adLogoScaleRep':
                    requestAnimationFrame(logoAnim);
                    break;
                default:
                    console.log('other Animation');
                    break;
                }
            }, false);
            /**
             * Represents a bottomDivision Animation End event.
             *
             * @event App#BottomDivisionAnimationEnd
             * @param {object} anim - animation information
             */
            this.curtainBottomTrigger.addEventListener('webkitAnimationEnd', function (anim) {
                if (anim.animationName === 'btmCurtain') {
                    that.animationClassHandler(that.lblBtm, 'lblContentBtm');
                    that.animationClassHandler(that.lblTop, 'lblContentTop');
                    that.animationClassHandler(that.hrSlide, 'hrSlideContent');
                    that.animationClassHandler(that.authorSign, 'signSlideContent');
                    that.animationClassHandler(that.authorContent, 'authorContent');
                    that.btmContentWrapper.style.opacity = 1;
                } else if (anim.animationName === 'btmCurtainRep') {
                    requestAnimationFrame(logoAnimRep);
                }
            });
            /**
             * Represents a video End Event Handler.
             * 
             * @event App#Video End
             */
            /*
            this.videoPlayer.addEventListener('ended', function () {
            	console.log('###========== Video End ==========###');
                requestAnimationFrame(curtainTopAnimRep);
                requestAnimationFrame(curtainBtmAnimRep);
                that.btmContentWrapper.style.opacity = 0;
            }, false);
			*/
        } catch (e) {
            console.log('%c Error: Issue in js/controller.js/handlers -- ' + e.message, 'background-color:red;color:white;');
        }
    };
    return App;
}());


var appInstance = new ApplicationOne();
appInstance.reqMethod('GET', 'data/data.json');
