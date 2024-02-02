/*
 * Copyright (c) 2023-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint new-cap: ["error", { "newIsCap": false }] */

const {promisify} = require('util'),
    aresGenerator = require('./lib/generator'),
    aresInspector = require('./lib/inspect'),
    aresInstaller = require('./lib/install'),
    aresLauncher = require('./lib/launch'),
    aresPackager = require('./lib/package'),
    aresPuller = require('./lib/pull'),
    aresPusher = require('./lib/pusher'),
    aresShell = require('./lib/shell'),
    aresServer = require('./lib/base/server'),
    aresSetupDevice = require('./lib/base/setup-device');

const Generator = new aresGenerator();

const Inspector = {
    inspect: promisify(aresInspector.inspect),
    stop: promisify(aresInspector.stop)
};

const Installer = {
    install: promisify(aresInstaller.install),
    remove: promisify(aresInstaller.remove),
    list: promisify(aresInstaller.list)
};

const Launcher = {
    close: promisify(aresLauncher.close),
    launch: promisify(aresLauncher.launch),
    listRunningApp: promisify(aresLauncher.listRunningApp)
};

const Packager = new aresPackager.Packager();

const Puller = {
    pull: promisify(aresPuller.pull)
};

const Pusher = new aresPusher();

const Server = {
    openBrowser: promisify(aresServer.openBrowser),
    runServer: promisify(aresServer.runServer),
    stop: promisify(aresServer.stop)
};

const Shell = {
    remoteRun: promisify(aresShell.remoteRun),
    shell: promisify(aresShell.shell)
};

const SetupDevice = {
    modifyDevice: promisify(aresSetupDevice.modifyDeviceInfo),
    removeDevice: promisify(aresSetupDevice.removeDeviceInfo),
    resetDeviceList: promisify(aresSetupDevice.resetDeviceList),
    setDefaultDevice: promisify(aresSetupDevice.setDefaultDevice),
    showDeviceList: promisify(aresSetupDevice.showDeviceList),
    showDeviceListFull: promisify(aresSetupDevice.showDeviceListFull),
};

module.exports = {
    Generator,
    Inspector,
    Installer,
    Launcher,
    Packager,
    Puller,
    Pusher,
    Server,
    Shell,
    SetupDevice
};
