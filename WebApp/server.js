var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs'),
    https = require('https');
app.use('/', express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(80, function () {
    console.log('server has started on port 80!');
});

