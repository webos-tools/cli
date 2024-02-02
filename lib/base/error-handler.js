/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const log = require('npmlog'),
    spinner = require('../util/spinner');

(function() {
    const errMsgHdlr = {},
        ErrMsgMap = {
            // service's error message, common
            "for category \"/dev\"": "Please enable \"Developer options\" on your device",

            // sessionmanager
            "SELECT_PROFILE": "Please select the profile on the display",

            // appinstalld
            "failed to extract ipk file": "Please check whether the ipk file is packaged by CLI or not",
            "Failed to parse control": "Please check whether the ipk file is packaged by CLI or not",
            "Failed to extract package": "Please check whether the ipk file is packaged by CLI or not",
            "duplicate command": "Please wait and retry the command",
            "update manifest file failed": "Please wait and retry the command",
            "Cannnot install privileged app on developer mode": "Please change the app id (app id should not start with 'com.lge', 'com.webos', 'com.palm')",
            "Cannnot remove privileged app on developer mode": "You cannot remove the privileged app whose app id start with 'com.lge', 'com.webos', 'com.palm'",
            "unable to execute smack": "Please remove the app and install again",
            "empty session list, cannot query getAppInfo": "Please select the profile on the display",
            "FAILED_REMOVE": "Please check app is installed to device by ares-install -l",

            // applicationmanager
            "Cannot find proper launchPoint": "The app is not installed app. Please check the list by ares-install -l",
            "is not running": "Please check the list of running apps using ares-launch -r",
            "was not found OR Unsupported Application Type": "The app is not installed. Please check the list of installed apps using ares-install -l",
            "invalid parameters": "Invalid parameters are passed. Please check the parameters",
            "app is locked": "The app is now installing/updating/deleting. Please try again later",

            // com.webos.service.sessionmanager
            "Service does not exist: com.webos.service.sessionmanager": "This device does not support multiple sessions",

            // com.webos.surfacemanager
            "ERR_INVALID_DISPLAY": "Please use a valid value for display id",

            "EACCES": "No permission to execute. Please check the directory permission",
            "EADDRINUSE": "An attempt to bind a server to a local address failed. Please check the IP address or the port number",
            "ECONNREFUSED": "Connection refused. Please check the device IP address or the port number",
            "ECONNRESET": "Unable to connect to the device. Please check the device",
            "ENOENT": "Please check if the path is valid",
            "ENOTDIR": "Please check if the path is valid",
            "EROFS": "Please check if the path is valid",
            "TIME_OUT": "Connection timed out. Please check the device IP address or the port number",
            "NO_FREE_SPACE": "Installation failure. Please check if there is sufficient free space in the disk",

            // can be external lib error
            "Authentication failure": "ssh authentication failure. Please check the ssh connection info such as password, private key and username again",
            "connect Unknown system": "Please check the device IP address or the port number",
            "Unable to parse private key": "Wrong passphrase for ssh key. Please check passphrase again",
            "Unable to request a pseudo-terminal": "Unable to open terminal (Target does not allow to open pty)",

            // invalid appinfo, service
            "REQUIRED_FIELD": "Please input required field",
            "INVALID_ID_RULE": "The app/pkg ID should consist of lowercase letters (a-z), numbers (0-9), plus (+) and minus (-) signs and periods (.)",
            "INVALID_VERSION_RULE": "The app/pkg version number should consist of three non-negative integers, separated by dots.\nEach number cannot exceed 9 digits and cannot contain leading zeroes",
            "NOT_EXCLUDE_APPINFO": "You cannot exclude the appinfo.json file",
            "NOT_RELATIVE_PATH_APPINFO": "The pathname must be relative to the directory where the appinfo.json file is located",
            "NO_METAFILE": "No meta file (ex. appinfo.json, services.json) exists in the project directory",
            "NO_COMPONENT_FILE": "There is no component file for webOS package. File:",
            "NO_ACCOUNT": "Account directory is not supported. Please delete the 'account-templates.json' file.",
            "OVER_APPCOUNT": "You can package only one application at once",
            "INVALID_APPID": "App ID must start with package ID",
            "INVALID_SERVICEID": "ServiceID must start with package id",
            "INVALID_RESOURCEID": "Resource ID must start with package ID",
            "FAILED_MINIFY": "Failed to minify code. Please check the source code",

            // invalid value
            "INVALID_JSON_FORMAT": "Invalid JSON format",
            "INVALID_ARGV": "Please check arguments",
            "INVALID_INTERVAL": "Please use nonnegative integer value for the \"time-interval\" option",
            "INVALID_DISPLAY": "Please use nonnegative integer value for the \"display\" option",
            "INVALID_TEMPLATE": "Invalid template name",
            "INVALID_FILE": "Invalid file",
            "INVALID_VALUE": "Invalid value",
            "INVALID_DEVICENAME": "Invalid device name. The device name should consist of letters, numbers, and special characters ('-','_','#') and should start with letters or '_'",
            "INVALID_OBJECT": "Object format error",
            "INVALID_MODE": "Please specify an option, either '--add' or '--modify'",
            "INVALID_REMOVE_MODE": "Please set remove option",
            "INVALID_CAPTURE_FORMAT": "Please specify the file extension(.png, .bmp or .jpg)",
            "INVALID_CSV_FORMAT": "Please change the file extension to .csv",
            "INVALID_IP": "Plese check IP address format",
            "INVALID_COMMAND": "This command is invalid. Please check the supported commands using ares -l",
            "INVALID_COMBINATION": "This options cannot be used with display option",

            // set value & type error
            "EMPTY_PROFILE": "Profile is empty",
            "EMPTY_VALUE": "Please specify a value",
            "EXISTING_VALUE": "The specified value already exists",
            "EXISTING_FILETYPE_PATH": "A file with the same name at the specified location already exists",
            "SUPPORT_ONLY_IPK": "Only .ipk file is supported. Please check the file extension",
            "NOT_MATCHED_LOGDAEMON": "Logging daemon of CLI should be matched with that of the target device\nPlease change the logging daemon of CLI to same as that of the target device",
            "NOT_MATCHED_LOG": "There are no logs from the ID\nPlease check if the combination of options or the ID are valid",
            "NOT_DIRTYPE_PATH": "The specified path is not a directory",
            "NOT_EXIST_INSPECTOR": "Inspector is not running. Please call stop() after inspect the app",
            "NOT_EXIST_PATH": "The specified path does not exist",
            "NOT_EXIST_LOGDAEMON": "The specified daemon does not exist",
            "NOT_EXIST_LOGFILE": "A log file does not exist in the target device",
            "NOT_EXIST_SERVER": "Server is not running. Please call stop() after running the server",
            "NOT_EXIST_SSHKEY_PASSWD": "Private key file or password does not exist",
            "NOT_EXIST_DISPLAY": "No existing displayId from getSessionList",
            "NOT_EXIST_SIMULATOR": "No existing simulator excutable file which name starting with",
            "NOT_SUPPORT_COMMOND_DEPRECATED": "This command is deprecated. Please use \"ares-device\" instead of \"ares-device-info\"",
            "NOT_SUPPORT_COMMOND": "This command is not supported by current profile\nIf you want to use this command, please change profile using \"ares-config\" command\nCurrent profile:",
            "NOT_SUPPORT_OPTION": "This option is not supported by current profile\nIf you want to use this command, please change profile using \"ares-config\" command\nCurrent profile:",
            "NOT_SUPPORT_SESSION": "This device does not support multiple sessions",
            "NOT_SUPPORT_ENYO": "Enyo app packaging is not supported",
            "NOT_SUPPORT_AUTHTYPE": "Not supported auth type",
            "NOT_SUPPORT_RUNNINGLIST": "Not supported method to get running app information",
            "NOT_SUPPORT_JOURNALD": "journald does not support the option",
            "NOT_SUPPORT_PMLOGD": "pmlogd does not support the option",
            "NOT_SUPPORT_XZ": "xz file is not supported. Only .ipk file packaged with the CLI is supported",
            "NOT_USE_WITH_OPTIONS": "Do not use together with options",
            "EMPTY_FILENAME": "Please input log file name from --file-list option",
            "EMPTY_ID": "Please input an ID of an app or service",

            "USE_WITH_OPTIONS": "Use together with options",
            "USE_PKGID_PKGINFO": "packageId must be provided by using either the '--pkgid' or the '--pkginfofile' option",
            "USE_GDB": "Please use GDB to debug a native serivce",
            "NOT_IMPLEMENTED": "Not implemented",
            "NOT_HANDLE_FILE": "Don't know how to handle",
            "NOT_OVERWRITE_DIR": "Cannot overwrite the directory",
            "NOT_PACKAGE_WITH_OPTION": "Cannot package the app directory with option",
            "NOT_PACKAGE_WITH_PKGDIR": "Cannot package the directory with package directory",
            "NOT_PACKAGE_WITH_RESOURCE": "Cannot package the app or service directory with resource directory",
            "UNMATCHED_DEVICE": "No matched device",
            "CANNOT_REMOVE_DEVICE": "Cannot remove the device",
            "UNMATCHED_DISPLAY_AFFINITY": "Please use the same value for \"display\" and \"displayAffinity\"",

            "FAILED_CALL_LUNA": "luna-send command failed",
            "FAILED_GET_PORT": "Failed to get Debug port",
            "FAILED_GET_SVCPATH": "Failed to get service installation path",
            "FAILED_GET_SSHKEY": "Failed to get ssh private key",
            "FAILED_TRANSMIT_FILE": "File transmission error. Please try again",
            "FAILED_CREATE_DIR": "Cannot create directory in the destination path - permission denied",
            "FAILED_REMOVE_PACKAGE": "No packages installed or removed",
            "FAILED_FIND_SERVICE": "Failed to find a service with the specified name",

            "CONNECTED_MULTI_DEVICE": "Multiple devices are connected by novacom. Please specify the target name",
            "SET_DEFAULT_MULTI_DEVICE": "Multiple devices are set to default target. Please reset device list",
            "NEED_ROOT_PERMISSION": "Unable to connect to the target device. root access required",
            "MISSING_CALLBACK": "Missing completion callback",
            "USING_WEBINSPECTOR": "Web Inspector is already connected with another browser. Please close the previous connection",
            "UNKNOWN_OPERATOR": "Unknown operator",
            "UNABLE_USE_SFTP": "Unable to use sftp",
        };

    // Pure CLI Tip error : errKey(string), option, value
    // Luna service error : errKey("FAILED_CALL_LUNA"- string), option, null, heading(service name)
    // System call & ssh call error : errKey(object)
    errMsgHdlr.getErrMsg = function(errKey, option, value, heading) {
        log.silly("error-handler#getErrMsg()", "errKey:", errKey, ", option:", option, ", value:", value, ", heading:", heading);
        // Return errKey when errKey is null
        if (!errKey) {
            return errKey;
        }

        const orgErrKey = errKey,
            resultErr = [];
        let mapErrMsg = "";

        // Handle systemcall or ssh call err message. errKey is must be object
        if (typeof orgErrKey === "object") {
            // Change errkey and heading to create Tips meessage;
            let sysHeading = "syscall",
                sysErrKey = orgErrKey.code;

            // Handle as "ssh execution error"
            if (!orgErrKey.syscall) {
                sysHeading = "ssh exec";
                sysErrKey = orgErrKey.message.trim();
            }

            const sysCallErr = new CLIError(sysHeading, orgErrKey.message.trim());
            if (sysCallErr.message) {
                resultErr.push(sysCallErr);
            }
            // Set parametars to create Tips message
            errKey = sysErrKey;
            option = orgErrKey.path;
            value = "";
            heading = "";

        } else if (orgErrKey === "FAILED_CALL_LUNA" && heading) {
            mapErrMsg = errMsgHdlr.getErrStr(orgErrKey, option, value);
            if (!mapErrMsg) {
                return orgErrKey; // Do not change modify this line.
            }
            const lunaErr = new CLIError(heading, mapErrMsg);
            if (lunaErr.message) {
                resultErr.push(lunaErr);
            }
            // Set parametars to create Tips message
            errKey = option;
            option = "";
            value = "";
            heading = "";
        }

        // Create Tips message
        mapErrMsg = errMsgHdlr.getErrStr(errKey, option, value);

        if (mapErrMsg) {
            const tipsErr = new CLIError(heading, mapErrMsg);
            if (tipsErr.message) {
                resultErr.push(tipsErr);
            }
        }

        // Defense code to stop the spinner before showing an error message.
        spinner.stop();
        if (resultErr.length > 0) {
            return resultErr;
        } else {
            return orgErrKey;
        }
    };

    errMsgHdlr.getErrStr = function(errKey, option, value) {
        log.silly("error-handler#getErrStr()", "errKey:", errKey, ", option:", option, ", value:", value);

        if (!errKey) {
            return errKey;
        }

        let returnMsg;
        if (typeof errKey === 'string') {
            for (const key in ErrMsgMap) {
                if (errKey.toString() === key || errKey.includes(key)) {
                    returnMsg = ErrMsgMap[key];
                    if (option) {
                        returnMsg = returnMsg + " <" + option+ ">";
                    }
                    if (value) {
                        returnMsg = returnMsg + " : " + value;
                    }
                    break;
                }
            }
        }
        return returnMsg;
    };

    function CLIError(heading, message) {
        if (heading) {
             this.heading = "[" + heading + " failure"+ "]:";
        }
        this.message = message;
        this.stack = Error().stack;
    }

    CLIError.prototype = Object.create(Error.prototype);
    CLIError.prototype.heading = "[Tips]:";

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = errMsgHdlr;
    }
}());
