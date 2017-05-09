
# Singletron

This is a thin wrapper around [`node-ipc`](https://github.com/RIAEvangelist/node-ipc) to simplify inter-process communication among Electron apps. The main aim is to allow apps to share a single instance of Electron, to minimize memory foot-print.

## Usage

See [singletron-example](https://github.com/eliot-akira/singletron-example), especially the [initialization step](https://github.com/eliot-akira/singletron-example/blob/master/main.js#L62).

Below is an example of how to set up the server/clients. Please note that `startApp` and `createWindow` are defined earlier in the file.

In `main.js` (main process):

```js
const singletron = require('singletron')

// Share single instance of Electron

singletron.createClient().then(({ client, config }) => {

  console.log('Connected to singletron server', config)

  client.on('loaded', () => app.quit())

  client.emit('load', path.join(__dirname, 'index.html'))

}).catch((e) => {

  // Start the app instance
  startApp()

  // Start singletron server

  singletron.createServer().then(({ server, config }) => {

    console.log('Singletron server started', config)

    // Request from client
    server.on('load', function(data, socket) {

      console.log('Request for new window', data)

      // Create window for new app
      createWindow(data)

      server.emit(socket, 'loaded')
    })

  }).catch((e) => {
    console.log('Error creating singletron server')
  })
})
```

## Methods

#### createClient( options )

```js
options = {
  clientId: 'singletronClient',
  serverId: 'singletronServer'
}
```

Returns a promise that resolves if connected to an existing server.

On success, the `then()` handler will receive an object with two properties:

- `client` is an instance of `node-ipc`.
  - `client.emit( eventName, data )`
  - `client.on( eventName, (data, socket) => {} )`
- `config` is an object that the server sent
  - `id` - server ID
  - `versions` - `{ node, chrome, electron }`

It's up to the app how to negotiate with the server. In the example above, the client requests to open a new window with its `index.html`, then quits when it's loaded.

If no server is found, it throws: you can `catch()` it and start a server.

#### createServer( options )

```js
options = {
  serverId: 'singletronServer'
}
```

Returns a promise that resolves if server was created successfully.

On success, the `then()` handler will receive an object with two properties:

- `server` is an instance of `node-ipc`.
  - `server.emit( [ socket, ] eventName, data )`
  - `server.on( eventName, (data, socket) => {} )`
- `config` is the same object as described for client above

It's up to the app how to negotiate with the client. In the example above, the server listens for a request to open a new window with given URL.
