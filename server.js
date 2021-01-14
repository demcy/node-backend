const { Connection, Request, TYPES } = require("tedious");


// Create connection to database
const config = {
    authentication: {
        options: {
            userName: "demcy", // update me
            password: "Fm3E8m?Ax-w0" // update me
        },
        type: "default"
    },
    server: "den1.mssql7.gear.host", // update me
    options: {
        database: "demcy", //update me
        encrypt: true,
        trustServerCertificate: true,
        multiple: true
    }
};

let connection = new Connection(config);
connection.on('connect', function (err) {
    if(err) throw err;
    console.log("Connected");
});

function getDevices(res) {
    //request = new Request("SELECT CAST((SELECT * FROM Items FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER) AS NVARCHAR(MAX)) AS JSONDATA", function (err) {
    request = new Request("SELECT CAST((SELECT * FROM Items FOR JSON AUTO) AS NVARCHAR(MAX)) AS JSONDATA", function (err) {
        if (err) {
            console.log(err);
        }
    });
    request.on('row', function (columns) {
        let data = columns[0].value;
        console.log(data)
        res.end(data);
    });
    connection.execSql(request);
}

function postDevice(res, body) {
    const { name, count } = JSON.parse(body)
    let id = 0;
    request = new Request("INSERT Items (name, count) OUTPUT INSERTED.id VALUES (@name, @count);", function (err) {
        if (err) {
            console.log(err);
        }
    });
    request.addParameter('name', TYPES.VarChar, name);
    request.addParameter('count', TYPES.Int, count);
    request.on('row', function (columns) {
        console.log("Product id of inserted item is " + columns[0].value);
        id = columns[0].value;
    });
    request.on('requestCompleted', function () { 
        getDeviceById(res, id);
    });
    connection.execSql(request);
}

function getDeviceById(res, id){
    request = new Request("SELECT CAST((SELECT * FROM Items WHERE ID = @id FOR JSON AUTO, WITHOUT_ARRAY_WRAPPER) AS NVARCHAR(MAX)) AS JSONDATA;", function (err) {
        if (err) {
            console.log(err);
        }
    });
    request.addParameter('id', TYPES.Int, id);
    request.on('row', function (columns) {
        let data = columns[0].value;
        console.log(data)
        res.end(data);
    });
    connection.execSql(request);
}

function updateDeviceById(res, body, id){
    const { name, count } = JSON.parse(body)
    request = new Request("UPDATE Items SET name = @name, count = @count WHERE id = @id;", function (err) {
        if (err) {
            console.log(err);
        }
    });
    request.addParameter('id', TYPES.Int, id);
    request.addParameter('name', TYPES.VarChar, name);
    request.addParameter('count', TYPES.Int, count);
    request.on('requestCompleted', function () { 
        getDeviceById(res, id);
    });
    connection.execSql(request);
}

function deleteDeviceById(res, id){
    request = new Request("DELETE FROM Items WHERE id = @id;", function (err) {
        if (err) {
            console.log(err);
        }
    });
    request.addParameter('id', TYPES.Int, id);
    request.on('requestCompleted', function () { 
        res.write('Device is deleted')
        //getDeviceById(res, id);
    });
    connection.execSql(request);
}

module.exports = {
    getDevices,
    postDevice,
    getDeviceById,
    updateDeviceById,
    deleteDeviceById
}