const http = require('http');
const server = require('./server');
//const port = process.env.PORT || 8080

const httpServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

    res.writeHead(200, { 'Content-Type': 'application/json' });

    // Add Routes
    let url = req.url;
    if (url === '/Devices' && req.method === 'GET') {
        server.getDevices(res)
    }
    else if (url.match(/\/Devices\/([0-9]+)/) && req.method === 'GET') {
        let id = url.split('/')[2];
        server.getDeviceById(res, id);
    }
    else if (url.match(/\/Devices\/([0-9]+)/) && req.method === 'PUT') {
        let id = url.split('/')[2];
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            server.updateDeviceById(res, body, id);
        });
    }
    else if (url.match(/\/Devices\/([0-9]+)/) && req.method === 'DELETE') {
        let id = url.split('/')[2];
        server.deleteDeviceById(res, id);
    }
    else if (url === '/Devices' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            server.postDevice(res, body);
        });
    }
    else {
        res.end('Use routing!');
    }
});

const io = require("socket.io")(httpServer);

io.on("connection", (socket) => {
    console.log('User conected with socket id: ' + socket.id);
    socket.on("disconnect", (reason) => {
        console.log('User disconected with socket id: ' + socket.id);
        //socket.removeAllListeners()
    });
    socket.on('serverupdate', (data, state) => {
        console.log(socket.id + ' update broadcast')
        socket.broadcast.emit('update', data, state);
    });
    console.log(io.engine.clientsCount );

});

httpServer.listen(process.env.PORT || 8080, () => {
    console.log(`Server running at port 8080`);
});


// index.listen(port, () => {
//     console.log(`Server running at port ` + port);
// });