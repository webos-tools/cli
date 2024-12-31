/*jslint browser:true, unparam: true, indent: 4 */
/*global console: false */

/**
 * @file File is related with Data-Binding functionality inside the apps.
 * It has Publish Subscribe pattern for listening the changes from View to Controller or vice versa.
 * @author LG CSP-1
 */

try {
    /**
     * Creates DataBinder Class, where publish
     * @class DataBinder
     * @return {Object} publishSub Object
     */
    var DataBinder = function (object_id) {
            "use strict";
            //For loop var"s declarations
            var i, len, k, psLen, l, psNavLen,
                /** 
                 * pubSubObj Create a simple PubSub object
                 * @type {Object}
                 */
                pubSubObj = {
                    callbacks: {},
                    on: function (msg, callback) {
                        this.callbacks[msg] = this.callbacks[msg] || [];
                        this.callbacks[msg].push(callback);
                    },
                    publish: function (msg) {
                        this.callbacks[msg] = this.callbacks[msg] || [];
                        len = this.callbacks[msg].length;
                        for (i = 0;  i < len; i += 1) {
                            this.callbacks[msg][i].apply(this, arguments);
                        }
                    }
                },
                data_attr = "data-bind-" + object_id,
                message = object_id + ":change",
                /** 
                 * changeHandler Any Change inside the Binding element will invoke this event.
                 * @function changeHandler
                 */
                changeHandler = function (evt) {
                    var target = evt.target || evt.srcElement,
                        prop_name = target.getAttribute(data_attr);
                    if (prop_name && prop_name !== "") {
                        pubSubObj.publish(message, prop_name, target.value);
                    }
                };
            /**
             * Triggers view to model binding.
             *
             * @event DataBinder#change
             */
            document.addEventListener('change', changeHandler, false);
            /**
             * Publish data changes to view.
             *
             * @event DataBinder#pubSubObj
             */
            pubSubObj.on(message, function (evt, prop_name, new_val) {
                var elements = document.querySelectorAll("[" + data_attr + "=" + prop_name + "]"),
                    tag_name = "",
                    listItems = "",
                    newVal,
                    listContent;
                if (elements !== "undefined" && elements.length !== 0) {
                    psLen = elements.length;
                    for (k = 0; k < psLen; k += 1) {
                        tag_name = elements[k].tagName.toLowerCase();
                        switch (tag_name) {
                        case "input":
                        case "textarea":
                        case "select":
                            elements[k].value = new_val;
                            break;
                        case "video":
                        case "img":
                            elements[k].src = new_val;
                            break;
                        case "ul":
                        case "nav":
                            if (Object.prototype.toString.call(new_val) === "[object Object]") {
                                for (newVal in new_val) {
                                    if (new_val.hasOwnProperty(newVal)) {
                                        listItems += "<li>" + new_val[newVal] + "</li>";
                                    }
                                }
                            } else { //Array
                                psNavLen = new_val.length;
                                for (l = 0;  l < psNavLen; l += 1) {
                                    if (typeof new_val[l] === "object") { //Array with Objects
                                        listItems += "<li><ul>";
                                        for (listContent in new_val[l]) {
                                            if (new_val[l].hasOwnProperty(listContent) && listContent !== "_id") {
                                                if (listContent !== "image") {
                                                    listItems += "<li>" + new_val[l][listContent] + "</li>";
                                                }
                                            }
                                        }
                                        listItems += "</ul></li>";
                                    } else { //Array with elements
                                        listItems += "<li>" + new_val[l] + "</li>";
                                    }
                                }
                            }
                            elements[k].innerHTML = listItems;
                            break;
                        default:
                            elements[k].innerHTML = new_val;
                            break;
                        }
                    }
                }
            });
            return pubSubObj;
        },
        /**
         * Creates BindClass Class.
         * @class BindClass
         * @return {Object} publishSub Object
         */
        BindClass = function (dataAttr) {
            'use strict';
            /** 
             * creates the DataBinder instance and set/get to binding object.
             * @function bindSet
             * @return {Object}
             */
            var bindSet = (function () {
                var binder = new DataBinder(dataAttr),
                    bindObj = {
                        attributes: {},
                        // The attribute setter publish changes using the DataBinder PubSub
                        set: function (attr_name, val) {
                            this.attributes[attr_name] = val;
                            //pass this as parameter,So that initiator will be in bindObj context
                            binder.publish(dataAttr + ':change', attr_name, val, this);
                        },
                        get: function (attr_name) {
                            return this.attributes[attr_name];
                        },
                        binderObject: binder
                    };
                /**
                 * Subscribe to the PubSub.
                 *
                 * @event BindClass#dataAttributeChange
                 */
                binder.on(dataAttr + ':change', function (evt, attr_name, new_val, initiator) {
                    if (initiator !== bindObj) {
                        bindObj.set(attr_name, new_val);
                    }
                });
                return bindObj;
            }());
            return bindSet;
        };
} catch (e) {
    console.log('error in js/helper/util.js' + e.message);
}
