/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const bodyParser = require('body-parser'),
    Express = require('express'),
    fs = require('fs'),
    http = require('http'),
    npmlog = require('npmlog'),
    spawn = require('child_process').spawn,
    errHndl = require('./error-handler');

(function() {
    const log = npmlog;
    log.heading = 'server';
    log.level = 'warn';

    const platformOpen = {
        win32: [ "cmd" , "/c", "start" ],
        darwin:[ "open" ],
        linux: [ "xdg-open" ]
    };

    const server = {},
        sockets = {};
    let localServer,
        nextSocketId = 0;

    /**
     * Run a local web server based on the path
     * @param {path} path where local web server indicates.
     * @param {port} port number for web server. 0 means random port.
     * @param {Function} next a common-JS callback invoked when the DB is ready to use.
     */
    server.runServer = function(path, port, reqHandlerForIFrame, next) {
        log.verbose("server#runServer()");
        if (typeof reqHandlerForIFrame === 'function' && !next) {
            next = reqHandlerForIFrame;
            reqHandlerForIFrame = null;
        }
        const appPath = fs.realpathSync(path),
            app = new Express();

        app.use("/", Express.static(appPath));
        app.use("/ares_cli", Express.static(__dirname));
        app.use(bodyParser.json());

        if (reqHandlerForIFrame) {
            app.post('/ares_cli/@@ARES_CLOSE@@', function(req, res) {
                reqHandlerForIFrame("@@ARES_CLOSE@@", res);
            });
            app.post('/ares_cli/@@GET_URL@@', function(req, res) {
                reqHandlerForIFrame("@@GET_URL@@", res);
            });
        }

        localServer = http.createServer(app);
        localServer.on('error', function(err) {
            return next(errHndl.getErrMsg(err));
        });
        localServer.listen(port, function(err) {
            if (err) {
                return next(errHndl.getErrMsg(err));
            }
            const localServerPort = localServer.address().port,
                url = 'http://localhost:' + localServerPort;

            next(null, {
                "url": url,
                "port": localServerPort,
                "openBrowserUrl": url + "/ares_cli/ares.html",
                "msg":"Local server running on " + url
            });
        });
        localServer.on('connection', function(socket) {
            // Add a newly connected socket
            const socketId = nextSocketId++;
            sockets[socketId] = socket;
            log.verbose("Socket opened: ", socketId);
        });
    };

    /**
     * Open url with a web browser
     * @param {url} URL to be opened via web browser.
     * @param {browserPath} browser exectable path. (optional)
     * @param {Function} next a common-JS callback invoked when the DB is ready to use. (optional)
     */
    server.openBrowser = function(url, browserPath, next) {
        log.verbose("server#openBrowser()");
        let info = platformOpen[process.platform];
        if (typeof browserPath === 'function') {
            next = browserPath;
            browserPath = null;
        }
        if (browserPath && fs.existsSync(browserPath)) {
            if (process.platform === 'linux') {
                info.splice(0, 1); // delete 'xdg-open' command
            }
            info = info.concat([browserPath]);

            if (process.platform === 'darwin') {
                 info = info.concat(['--new', '--args']);
            }
        }

        this.browserProcess = spawn(info[0], info.slice(1).concat([url]));
        if (next) {
            next(null, {msg:"Browser opened"});
        }
    };

    server.stop = function(next) {
        log.verbose("server#stop()");
        if (!localServer) {
            return next(errHndl.getErrMsg("NOT_EXIST_SERVER"));
        }

        if (Object.keys(sockets).length) {
            for (const socketId in sockets) {
                log.verbose("Socket destroyed: ", socketId);
                sockets[socketId].destroy();
            }
        }

        localServer.close(function() {
            log.verbose("Local server close called");
            next(null, {msg: "Local server is stopped"});
        });
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = server;
    }
}());
