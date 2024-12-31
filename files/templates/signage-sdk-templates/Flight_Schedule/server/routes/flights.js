/*jslint nomen: true, unparam: true, node: true, indent: 4 */
/*global console*/
var mongo = require('mongodb'),
    https = require('https'),
    Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure,
    mongoserver = new Server('localhost', 27017, {auto_reconnect: true, native_parser: true}),
    db = new Db('FlightInfoDb', mongoserver),
    // Populate database with sample data -- Only used once: the first time the application is started.Not Req.Only for Demo
    populateDB = function () {
        'use strict';
        var flightInfo = [
            {
                airline: 'KoreanAir',
                flight: 'KE032',
                time: '12:00',
                destination: 'Newyork',
                status: 'OnTime',
                gate: 'A60'
            },
            {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '2:00',
                destination: 'Bangalore',
                status: 'OnTime',
                gate: 'A06'
            },
            {
                airline: 'JetBlue',
                flight: 'JB245',
                time: '11:45',
                destination: 'Dallas',
                status: 'Delayed',
                gate: 'G7'
            },
            {
                airline: 'Delta Airline',
                flight: 'DL198',
                time: '12:00',
                destination: 'philadelphia',
                status: 'OnTime',
                gate: 'B5'
            },
            {
                airline: 'JetBlue',
                flight: 'JB247',
                time: '01:00',
                destination: 'philadelphia',
                status: 'OnTime',
                gate: 'C4'
            },
            {
                airline: 'Delta Airline',
                flight: 'DL192',
                time: '10:50',
                destination: 'Los Angeles',
                status: 'OnTime',
                gate: 'B2'
            },
            {
                airline: 'American Airline',
                flight: 'AA158',
                time: '09:35',
                destination: 'Dallas',
                status: 'OnTime',
                gate: 'A5'
            },
            {
                airline: 'KoreanAir',
                flight: 'KE034',
                time: '07:45',
                destination: 'philadelphia',
                status: 'Delayed',
                gate: 'A9'
            },
            {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            },
            {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            }, {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            }, {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            },
            {
                airline: 'KoreanAir',
                flight: 'KE032',
                time: '12:00',
                destination: 'Newyork',
                status: 'OnTime',
                gate: 'A60'
            },
            {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '2:00',
                destination: 'Bangalore',
                status: 'OnTime',
                gate: 'A06'
            },
            {
                airline: 'JetBlue',
                flight: 'JB245',
                time: '11:45',
                destination: 'Dallas',
                status: 'Delayed',
                gate: 'G7'
            },
            {
                airline: 'Delta Airline',
                flight: 'DL198',
                time: '12:00',
                destination: 'philadelphia',
                status: 'OnTime',
                gate: 'B5'
            },
            {
                airline: 'JetBlue',
                flight: 'JB247',
                time: '01:00',
                destination: 'philadelphia',
                status: 'OnTime',
                gate: 'C4'
            },
            {
                airline: 'Delta Airline',
                flight: 'DL192',
                time: '10:50',
                destination: 'Los Angeles',
                status: 'OnTime',
                gate: 'B2'
            },
            {
                airline: 'American Airline',
                flight: 'AA158',
                time: '09:35',
                destination: 'Dallas',
                status: 'OnTime',
                gate: 'A5'
            },
            {
                airline: 'KoreanAir',
                flight: 'KE034',
                time: '07:45',
                destination: 'philadelphia',
                status: 'Delayed',
                gate: 'A9'
            },
            {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            },
            {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            }, {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            }, {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            },
            {
                airline: 'KoreanAir',
                flight: 'KE032',
                time: '12:00',
                destination: 'Newyork',
                status: 'OnTime',
                gate: 'A60'
            },
            {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '2:00',
                destination: 'Bangalore',
                status: 'OnTime',
                gate: 'A06'
            },
            {
                airline: 'JetBlue',
                flight: 'JB245',
                time: '11:45',
                destination: 'Dallas',
                status: 'Delayed',
                gate: 'G7'
            },
            {
                airline: 'Delta Airline',
                flight: 'DL198',
                time: '12:00',
                destination: 'philadelphia',
                status: 'OnTime',
                gate: 'B5'
            },
            {
                airline: 'JetBlue',
                flight: 'JB247',
                time: '01:00',
                destination: 'philadelphia',
                status: 'OnTime',
                gate: 'C4'
            },
            {
                airline: 'Delta Airline',
                flight: 'DL192',
                time: '10:50',
                destination: 'Los Angeles',
                status: 'OnTime',
                gate: 'B2'
            },
            {
                airline: 'American Airline',
                flight: 'AA158',
                time: '09:35',
                destination: 'Dallas',
                status: 'OnTime',
                gate: 'A5'
            },
            {
                airline: 'KoreanAir',
                flight: 'KE034',
                time: '07:45',
                destination: 'philadelphia',
                status: 'Delayed',
                gate: 'A9'
            },
            {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            },
            {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            }, {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            }, {
                airline: 'Asiana Airline',
                flight: 'A321',
                time: '01:30',
                destination: 'Hongkong',
                status: 'Delayed',
                gate: 'D8'
            },
            {
                airline: 'American Airline',
                flight: 'AA156',
                time: '01:30',
                destination: 'Los Angeles',
                status: 'Cancelled',
                gate: 'F6'
            }];
        db.collection('flightInfo', function (err, collection) {
            collection.insert(flightInfo, {safe: true}, function (err, result) {
                console.log('populated DB with dummy records');
            });
        });
    };

db.open(function (err, db) {
    'use strict';
    if (!err) {
        console.log('Connected to FlightInfoDb database');
        db.collection('flightInfo', {strict: true}, function (err, collection) {
            if (err) {
                console.log('The flightInfo collection doesnt exist. Creating it with sample data...');
                populateDB();
            }
        });
    }
});

exports.findById = function (req, res) {
    'use strict';
    var id = req.params.id;
    console.log('Retrieving flight: ' + id);
    db.collection('flightInfo', function (err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function (req, res) {
    'use strict';
    var collection = db.collection('flightInfo');
    collection.count(function (err, count) {
        res.send({ 'count': count}).end();
    });
};

exports.find = function (req, res) {
    'use strict';
    var skipRecords = req.params.skip;
    skipRecords = parseInt(skipRecords, 10);
    db.collection('flightInfo', function (err, collection) {
        collection.find().skip(skipRecords).limit(10).toArray(function (err, items) {
            res.send(items).end();
        });
    });
};

exports.addFlight = function (req, res) {
    'use strict';
    var flight = req.body;
    console.log(flight);
    console.log('Adding flight: ' + JSON.stringify(flight));
    db.collection('flightInfo', function (err, collection) {
        //console.log(collection);
        collection.insert(flight, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.updateFlight = function (req, res) {
    'use strict';
    var id = req.params.id,
        flight = req.body;
    console.log('Updating flight: ' + id);
    console.log(JSON.stringify(flight));
    db.collection('flightInfo', function (err, collection) {
        collection.update({'_id': new BSON.ObjectID(id)}, flight, {safe: true}, function (err, result) {
            if (err) {
                console.log('Error updating flight: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log(' ' + result + ' document(s) updated');
                res.send(flight);
            }
        });
    });
};

exports.deleteFlight = function (req, res) {
    'use strict';
    var id = req.params.id;
    console.log('Deleting flight: ' + id);
    db.collection('flightInfo', function (err, collection) {
        collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred - ' + err});
            } else {
                console.log(' ' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};