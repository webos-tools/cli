#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

if (process.platform === 'darwin' || process.platform === 'linux') {
    const confPath = path.resolve('files/conf');
    const files = [
        path.join(confPath, 'ares.json'),
        path.join(confPath, 'command-service.json'),
        path.join(confPath, 'config.json'),
        path.join(confPath, 'ipk.json'),
        path.join(confPath, 'novacom-devices.json'),
        path.join(confPath, 'sdk.json'),
        path.join(confPath, 'template.json'),
        path.join(confPath, 'query/query-app.json'),
        path.join(confPath, 'query/query-hosted.json'),
        path.join(confPath, 'query/query-package.json'),
        path.join(confPath, 'query/query-service.json')
    ];

    files.forEach(file => {
        fs.chmodSync(file, 0o666);
    });
}
