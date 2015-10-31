'use strict'

let SensorTag = require('sensortag')
let async = require('async')
let ws = require("nodejs-websocket")

const ALLOW_ALL_CLIENTS = true

let knownSensors = {
    "b0:b4:48:b8:21:83": {
        name: 'hst'
    },
    "c4:be:84:71:42:8c": {
        name: 'omo'
    }
}

let viewerList = []
let clientList = []

function onConnected(sensor, details) {
    clientList.push({sensor, details})

    sendTextToViewer({
        event: 'connection',
        address: sensor.address,
        client: details ? details.name : 'unknown'
    })

    sensor.on('simpleKeyChange', (left, right, reedRelay) => {
        sendTextToViewer({
            event: 'keychange',
            address: sensor.address,
            client: details ? details.name : 'unknown',
            data: {left, right}
        })

        console.log('left: ' + left)
        console.log('right: ' + right)
        console.log('reedRelay: ' + reedRelay)
    })

    sensor.on('disconnect', () => {
        console.log('disconnect from', sensor.address)
        //clientList.forEach()
    })

    sensor.notifySimpleKey()
    SensorTag.discoverAll(onDiscoveredSensor)
}

function onDiscoveredSensor(sensor) {
    let addr = sensor.address.toLowerCase()
    let details
    if (addr in knownSensors) {
        details = knownSensors[addr]
    }

    if (!details && !ALLOW_ALL_CLIENTS) {
        console.log('unknown sensor with address ' + sensor.address + ' was identified')
        return
    }

    SensorTag.stopDiscoverAll(onDiscoveredSensor)
    sensor.connectAndSetUp(() => {
        onConnected(sensor, details)
    })
}

function sendTextToViewer(text) {
    text = JSON.stringify(text)

    if (!viewerList.length) {
        console.log('no connected viewers')
        return
    }

    console.log('sending data', text)

    viewerList.forEach(conn => {
        conn.sendText(text)
    })
}

function setupWebSocket() {
    let server = ws.createServer(function (conn) {
        viewerList.push(conn)
        conn.on("text", function (str) {
            console.log("Received "+str)
            //conn.sendTextToViewer(str.toUpperCase()+"!!!")
        })
        conn.on("close", function (code, reason) {
            viewerList.forEach((val, index) => {
                console.log('connection close', 'check index', index)
                if (conn === val) {
                    viewerList.splice(index)
                    return
                }
            })
        })

        clientList.forEach(client => {
            conn.sendText(JSON.stringify({
                event: 'connection',
                address: client.sensor.address,
                client: client.details ? client.details.name : 'unknown'
            }))
        })
    }).listen(8001)
}

setupWebSocket()
SensorTag.discoverAll(onDiscoveredSensor)
