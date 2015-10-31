'use strict'

let SensorTag = require('sensortag')
let async = require('async')

let mac = "b0:b4:48:b8:21:83"


SensorTag.discoverByAddress(mac, sensorTag => {
    console.log('discovered: ' + sensorTag);

    sensorTag.on('disconnect', function() {
        console.log('device disconnected');
    });

    async.series([
        function(cb) {
            sensorTag.connectAndSetUp(function() {
                console.log('connected to device');
                cb();
            });
        },
        function(cb) {
            sensorTag.readFirmwareRevision(function (err, firmwareRev) {
                console.log('firmware rev = ' + firmwareRev);
                cb();
            });
        },
        function(cb) {
            sensorTag.enableIrTemperature(cb);
        },
        function(cb) {
            var checkTemp = function(cb2) {
                sensorTag.readIrTemperature(function(error, objectTemperature, ambientTemperature) {
                    console.log('\tobject temperature = %d °C', objectTemperature.toFixed(1));
                    console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1));
                    cb2();
                });
            }

            async.series([
                checkTemp,
                checkTemp
            ]);
        }
    ]);
});

