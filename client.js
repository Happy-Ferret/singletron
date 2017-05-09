const ipc = require('node-ipc')

module.exports = function createClient(options = {}) {

  const clientId = options.clientId || 'singletronClient'
  const serverId = options.serverId || 'singletronServer'

  return new Promise((resolve, reject) => {

    ipc.config.id = clientId
    ipc.config.maxRetries = 0
    ipc.config.silent = true

    ipc.connectTo(serverId, () => {

      const client = ipc.of[serverId]

      client.on('connect', () => {
        client.emit('handshakeRequest', {
          id: ipc.config.id,
          pid: process.pid
        })
      })

      client.on('handshakeResponse', (config, socket) => {
        resolve({ client, config })
      })

      client.on('disconnect', reject)
    })
  })
}
