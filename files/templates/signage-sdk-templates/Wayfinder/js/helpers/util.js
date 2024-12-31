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
            'use strict';
            //For loop var's declarations
            var i, len, k, psLen, j, psTabLen, u, navLen, navList, navCls, z,
                /** 
                 * pubSubObj Create a simple PubSub object
                 * @type {Object}
                 */
                pubSubObj = { // Create a simple PubSub object
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
                data_attr = 'data-bind-' + object_id,
                message = object_id + ':change',
                /** 
                 * changeHandler Any Change inside the Binding element will invoke this event.
                 * @function changeHandler
                 */
                changeHandler = function (evt) {
                    var target = evt.target || evt.srcElement,
                        prop_name = target.getAttribute(data_attr);
                    if (prop_name && prop_name !== '') {
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
                var elements = document.querySelectorAll('[' + data_attr + '=' + prop_name + ']'),
                    tag_name = '',
                    tdItems = '',
                    tabElement = '',
                    tabElementLen = '';
                if (elements !== 'undefined' && elements.length !== 0) {
                    psLen = elements.length;
                    for (k = 0; k < psLen; k += 1) {
                        tag_name = elements[k].tagName.toLowerCase();
                        switch (tag_name) {
                        case 'input':
                        case 'textarea':
                        case 'select':
                            elements[k].value = new_val;
                            break;
                        case 'video':
                        case 'img':
                            elements[k].src = new_val;
                            break;
                        case 'table':
                            tdItems = '<table>';
                            psTabLen = new_val.length;

                            if (elements[k].classList.contains('table')) {
                                for (j = 0;  j < psTabLen; j += 1) {
                                    tdItems += '<tr><td>' + new_val[j].shopNo + '</td><td>' + new_val[j].shopName + '</td></tr>';
                                }
                            } else {
                                for (j = 0;  j < psTabLen; j += 1) {
                                    tdItems += '<tr><td><label>' + new_val[j].shopNo + '</label><span>' + new_val[j].shopName + '</span></td></tr>';
                                }
                            }
                            tdItems += '</table>';
                            elements[k].innerHTML = tdItems;
                            break;
                        case 'tbody':
                            tdItems = '';
                            psTabLen = new_val.length;
                            for (j = 0;  j < psTabLen; j += 1) {
                                tdItems += '<tr>';
                                tabElement = new_val[j];
                                tabElementLen = new_val[j].length;
                                for (z = 0;  z < tabElementLen; z += 1) {
                                    tdItems +=  '<td><label>' + tabElement[z].shopNo + '</label><span>' + tabElement[z].shopName + '</span></td>';
                                }
                                tdItems += '</tr>';
                            }
                            elements[k].innerHTML = tdItems;
                            break;
                        case 'ul':
                            navList = '';
                            navLen = new_val.length;
                            navCls = elements[k].classList[0];

                            for (u = 0;  u < navLen; u += 1) {
                                navList += '<li class=' + navCls + new_val[u].shopNo + '>' + new_val[u].shopNo + '</li>';
                            }

                            elements[k].innerHTML = navList;
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
