module.exports = {
    Server: typeof window == 'undefined' ? require('./lib/server/index.js') : null,
    Client: require('./lib/client/index.js')
}