module.exports = {
    Server: typeof window == 'undefined' ? function (...args) { 
        var RoomSystem = require('./lib/server/index.js').default;
        return new RoomSystem(...args)
     } : null,
    Client: require('./lib/client/index.js').default
}