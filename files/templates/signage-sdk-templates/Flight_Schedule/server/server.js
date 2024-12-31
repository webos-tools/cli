/*jslint nomen: true, unparam: true, node: true, indent: 4 */
/*global console*/
var express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bdyParser = require('body-parser'),
    flight = require('./routes/flights'),
    http = require('http'),
    MongoWatch = require('mongo-watch'),
    watcher = new MongoWatch({useMasterOplog: true, parser: 'pretty'}),
    server = http.Server(app).listen(8989),
    io = require('socket.io').listen(server),
    fs = require('fs');

//app.configure doesnt support
app.set('case sensitive routing', true);
app.use(morgan('dev')); // express.logger('dev') no longer supports, use morgan package
app.use(bdyParser.json()); //express.bodyParser() no longer supports, use bdyparser package 


app.get('/flights/', flight.findAll);
app.get('/flights/:skip', flight.find);
app.get('/flights/:id', flight.findById);
app.post('/flights', flight.addFlight);
app.put('/flights/:id', flight.updateFlight);
app.delete('/flights/:id', flight.deleteFlight);

/**
 * socket connection on event.
 *
 * @event io.sockets#connection
 */
/*DB Push is not required at client end
io.sockets.on('connection', function (socket) {
    'use strict';
    //watching db
    watcher.watch('FlightInfoDb.flightInfo', function (event) {
        socket.volatile.emit('dbNotification', event);
        socket.on('myDb', function (data) {
            console.log('db return event' + data);
        });
    });
});*/