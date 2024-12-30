/*global BindClass: false */
/*jslint browser:true, indent: 4*/

/**
 * @file Manages the configuration of the HTML application.
 * Loading the JSON data in application to binding the data into the page.
 * This application contains an inbuilt library 'Slider', using which all the sliding effect among images and videos has been set.
 * Please check the example for understaing it.
 * @author LG CSP-1
 * @example
 * 'Slider' library is built inside in this application will help you add more images and videos
 *  to loop as well as gives you some configuration changes.
 * 
 * // TO ADD IMAGES and VIDEOS IN SLIDER
 * For adding images and videos in slider,
 *  please create an LI element and then place your IMG or VIDEO tag inside it and, put it inside UL element('carousel').
 * Check HTML file for more information.
 * 
 * // TO CONFIGURE SLIDER
 * 
 * var s = new Slider();
 * s.init({
 *     interval: 4000                // Set Slider Interval 4000 - 4 sec.
 *     autoplayVideo: true           // TRUE will make video runs automatically on coming in front, FALSE will not play video.
 *     moveTowardsNext:true          // TRUE will move slider towards left, FALSE will move slider towards right.
 *     animationTime : 1000;         // Set the Animation tranisition speed
 * });
 * 
 * Check Controller.js file for more information.
 *
 */
/* Plugin Start */
var currentItem = 1, countAnimation = 0;
var status = "NOT RUN";
var totalLength = 10,
	appCount = 0;
	maxlength1 = 0,
	maxlength2 = 0;

var Slider = function () {
    this.interval =  3000;
    this.animationTime = 1000;
    this.autoplay = true;
    this.autoplayVideo = true;
    this.moveTowardsNext = true;
    this.carousel = document.getElementById('carousel');
    this.carouselItems = this.carousel.children.length;
    this.carouselChilds = [].slice.call(this.carousel.children);
    this.carouselSlider = document.getElementById('carouselSlider');
    this.height = this.carouselSlider.getClientRects()[0].height;
    this.width =  this.carouselSlider.getClientRects()[0].width;
    this.carouselInterval = null;
    this.animFlag = true;
    this.videoIndex = [];
    this.flashIndex = [];
    this.isVideoPlaying = false;
    this.movedDuringVideoPlay = false;
};
/* intialize slider with User Defined Object or continue with default */
Slider.prototype.init = function (obj) {
    if (obj) {
        if (obj.interval) {
            this.interval = obj.interval;
        }
        if (obj.autoplay) {
            this.autoplay = obj.autoplay;
        }
        if (obj.animationTime) {
            this.animationTime = obj.animationTime;
        }
        if (obj.autoplayVideo) {
            this.autoplayVideo = obj.autoplayVideo;
        }
        if (obj.moveTowardsNext) {
            this.moveTowardsNext = obj.moveTowardsNext;
        }
        if (obj.carousel) {
            this.carousel = document.getElementById(obj.carousel);
            this.carouselItems = this.carousel.children.length;
            this.carouselChilds = [].slice.call(this.carousel.children);
        }
        if (obj.carouselSlider) {
            this.carouselSlider = document.getElementById(obj.carouselSlider);
            this.height = this.carouselSlider.getClientRects()[0].height;
            this.width =  this.carouselSlider.getClientRects()[0].width;
        }
    }
    this.checkVideoIndex();
    this.getParentSize();
};
/* Clear Slider Interval */
Slider.prototype.clearSliderInterval = function () {
    clearInterval(this.carouselInterval);
};
/* Restart Slider with paramter to stat immediately : moveRequire */
Slider.prototype.setSliderInterval = function (moveRequire) {
    var that = this;
    this.carouselInterval = setInterval(function () {
        that.slider(that.moveTowardsNext);
    }, this.interval);

    /* On Resume , Move the Slider to Next */
    if (moveRequire) {
        if (this.moveTowardsNext) {
            this.moveNext();
        } else {
            this.movePrev();
        }
    }
};
/* Video Events */
Slider.prototype.endVideoTrigger = function () {
    var that = this;
    return function () { // function (e)
        //e.currentTarget.currentTime = 0.0;
        that.isVideoPlaying = false;
        if (that.autoplay) {
            //that.setSliderInterval(true);
            that.clearSliderInterval();
            that.slider(that.moveTowardsNext);
        }
    };
};
/* End Flash Timer */
Slider.prototype.endFlashTimer = function () {
    var that = this;
    //e.currentTarget.currentTime = 0.0;
    that.isVideoPlaying = false;
    if (that.autoplay) {
        //that.setSliderInterval(true);
        that.clearSliderInterval();
        that.slider(that.moveTowardsNext);
    }
};
Slider.prototype.pauseVideoTrigger = function () {
    var that = this;
    return function () {
        that.isVideoPlaying = false;
    };
};
Slider.prototype.playVideoTrigger = function () {
    var that = this;
    return function () {
        that.isVideoPlaying = true;
        that.playVideo();
    };
};
/* Pause/Resume Event in Video */
Slider.prototype.pausePlay = function () {
    if (this.autoplay) {
        this.autoplay = false;
        this.clearSliderInterval();
    } else {
        this.autoplay = true;
        this.setSliderInterval(true);
    }
};
Slider.prototype.animationEnd = function (e) {
    var that = this;
    if (e.classList.length === 2) {
        ++countAnimation;
        // array change
        var ele = that.carouselChilds.shift();
        that.carouselChilds.push(ele);
        //dom change
        that.carousel.appendChild(ele);
        e.classList.remove('animateSlideIn');
    } else {
        ++countAnimation;
        e.classList.remove('animateSlideIn');
    }
    if (countAnimation >= 2) {
        if (currentItem === that.carouselItems) {
            setTimeout(function () {
                location.reload(true);
            }, (this.interval - 1400));
        }
        countAnimation = 0;
        this.animFlag = true;
        // Checking for Video To Play by matching with the CurrentIndex
        if ((that.videoIndex.indexOf(currentItem) >= 0) && that.autoplayVideo) {
			that.playVideo();			
        }
        // Checking for Flash To Play by matching with the CurrentIndex
        if ((that.flashIndex.indexOf(currentItem) >= 0) && that.autoplayVideo) {
            that.playFlash();
        }
    }
};
Slider.prototype.checkVideoIndex = function() {

	var pp0 = this.carouselChilds[0], vv0 = pp0.children[0];
	var pp1 = this.carouselChilds[1], vv1 = pp1.children[0];
	var that = this;
	
	setInterval(function() {		
		if (vv0.duration > maxlength1) {
			maxlength1 = vv0.duration;
			totalLength += maxlength1;
		}
		if (vv1.duration > maxlength2) {
			maxlength2 = vv1.duration;
			totalLength += maxlength2;
		}
		appCount++;
		if (appCount > totalLength)
			location.reload();
	}, 1000);

	var ele, i, p;
	for (i = 0; i < this.carouselItems; i++) {
		ele = this.carouselChilds[i];
		p = ele.children.item();
		if (p.tagName === 'VIDEO') {
			// pushing in indexes in array
			this.videoIndex.push((i + 1));
			// Register Video End Event
			p.addEventListener('ended', this.endVideoTrigger());
			p.addEventListener('play', this.playVideoTrigger());
			p.addEventListener('pause', this.pauseVideoTrigger());
		} else if (p.tagName === 'OBJECT') {
			this.flashIndex.push((i + 1));
		}
	}
};

/* Move Next */
Slider.prototype.moveNext = function () {
    this.clearSliderInterval();
    var visibleIndex = 2, currentIndex = 1,  that = this;

    // Moving the first child
    var child = this.carouselChilds[currentIndex];
    child.classList.add('animateSlideIn');
    child.classList.remove('active');
    setTimeout(function () {
        that.animationEnd(child);
    }, that.animationTime);
    // Bringing up the the next child
    var child_v = this.carouselChilds[visibleIndex];
    child_v.classList.add('animateSlideIn');
    child_v.classList.add('active');
    if (this.carouselItems > currentItem) {
        ++currentItem;
    } else {
        currentItem = 1;
    }
    setTimeout(function () {
        that.animationEnd(child_v);
    }, that.animationTime);
    if (this.autoplay) {
        this.setSliderInterval();
    }
};
Slider.prototype.movePrev = function () {
    this.clearSliderInterval();

    var visibleIndex = 0, currentIndex = 1;
    // Moving the first child
    var child = this.carouselChilds[currentIndex];
    child.classList.add('animateSlideInRight');
    child.classList.remove('active');

    var child_v = this.carouselChilds[visibleIndex];
    child_v.classList.add('animateSlideInRight');
    child_v.classList.add('active');

    if (this.autoplay) {
        this.setSliderInterval();
    }

    // Setting Current Index
    if (currentItem > 1) {
        --currentItem;
    } else {
        currentItem = this.carouselItems;
    }
};
Slider.prototype.playVideo = function () {
    // removing interval as video need to play
    this.clearSliderInterval();
    try {
        var p = this.carouselChilds[1],
            v = p.children[0];
        v.play(); 
		} catch (e) {
        console.log(e);
    }
};
Slider.prototype.playFlash = function () {
    // removing interval as video need to play
    this.clearSliderInterval();
    var that = this;
    try {
        var p = this.carouselChilds[1],
            v = p.children[0],
            timer = (v.children.time.value) * 1000;

        v.Play();
        setTimeout(function () {
            //e.currentTarget.currentTime = 0.0;
            that.isVideoPlaying = false;
            if (that.autoplay) {
                //that.setSliderInterval(true);
                that.clearSliderInterval();
                that.slider(that.moveTowardsNext);
            }
        }, timer);
    } catch (e) {
        console.log(e);
    }
};
Slider.prototype.resetHeightWidth = function () {
    this.height = this.carouselSlider.getClientRects()[0].height;
    this.width =  this.carouselSlider.getClientRects()[0].width;
};
Slider.prototype.moveLastChildFront = function () {
    var child = this.carouselChilds[this.carouselItems - 1];
    // Array change
    this.carouselChilds.unshift(child);
    this.carouselChilds.pop();
    // dom change
    child = this.carousel.removeChild(child);
    this.carousel.insertBefore(child, this.carousel.childNodes[0]);
    this.startSlider();
};
Slider.prototype.getParentSize = function () {
    var height = this.carouselSlider.getClientRects()[0].height;
    var width = this.carouselSlider.getClientRects()[0].width;
    var i;
    // Inner Element Width Settings
    this.carousel.style.width = (this.carouselItems * width) + 'px';
    this.carousel.style.height = height + 'px';
    this.carousel.style.left = (-width) + 'px';
    // All Inner Elements 
    var child;
    for (i = this.carouselItems - 1; i >= 0; i--) {
        child = this.carousel.children[i];
        child.style.width = width + 'px';
        child.style.height = height + 'px';
    }

    //move last child at front
    this.moveLastChildFront();
};
Slider.prototype.startSlider = function () {
    var that = this;
    if (that.videoIndex.indexOf(currentItem) !== -1 && that.autoplayVideo) {
        that.playVideo();
    } else if (that.flashIndex.indexOf(currentItem) !== -1 && that.autoplayVideo) {
        that.playFlash();
    } else {
        this.carouselInterval = setInterval(function () {
            if (that.autoplay) {
                that.slider(that.moveTowardsNext);
            }
        }, this.interval);
    }
};
Slider.prototype.slider = function (move) {
    if (move) {
        if (this.animFlag) {
            this.animFlag = false;
            this.moveNext();
        }
    } else {
        if (this.animFlag) {
            this.animFlag = false;
            this.movePrev();
        }
    }
};
/* Plugin End */

var dataSet;
/**
 * Binds data to HTML Page.
 * @method bindData
 * @param {Object} jsonData - Object contains data to put into HTML
 * @example
 * For Example : 
 * 'jsonData.image' will hold the path of an image to be set into the html page.
 * For Img Tag attribute 'data-bind-appTwo', we set value as 'image'(See Below).
 *               
 *     //  img data-bind-appTwo = "image"
 *       
 * To set the value from Object to html tag, we need to put the code : 
 *     //  info.set('image', jsonData.image)
 *
 * here, first argument is the name of html tag's attribute value and,
 *             second is the value from javascript Object.
*/
function bindData(jsonData) {
    'use strict';
    var info = new BindClass('appTwo');
    /* Video */
    info.set('video1', jsonData.videoPath1);
    info.set('video2', jsonData.videoPath2);
    info.set('image', jsonData.image);
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
loadDoc('GET', 'data/data.json');

/* Slider Init*/
var s = new Slider();
s.init({
    interval: 4000,
    animationTime: 1200
});