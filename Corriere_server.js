var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/myaction', function(req, res) 
{
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send("funziona!");   
});

app.set('address', process.env.OPENSHIFT_NODEJS_IP);
app.listen(process.env.OPENSHIFT_NODEJS_PORT, function()
{ //console.log(app.get('address'));
  // console.log('Sto ascoltando...');
});





