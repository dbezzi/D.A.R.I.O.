var tools = require(__dirname + '/tools');

var removeDiacritics = require('diacritics').remove;
var fs = require('fs'); 
var mustache = require('mustache'); 
var url = require('url'); 

var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    hostname = process.env.OPENSHIFT_NODEJS_IP || 'localhost',
    port = process.env.OPENSHIFT_NODEJS_PORT || 3000,
    publicDir = __dirname + '/public';

var RIMARIO = require(__dirname + '/rimario');


app.get("/", function (req, res) {
  res.redirect("/index.html");
});

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(publicDir));

console.log("Server in ascolto all'indirizzo http://%s:%s", hostname, port);
app.listen(port, hostname);


app.get('/definizione', function(req, res)
{ 
  var queryObject = url.parse(req.url,true).query;
  tools.Definizione(queryObject.lemma, function(result)
  {
         res.send(result.replace(/\n/g, "")); //restituisce direttamente una stringa
  });

});


app.post('/', function(req, res)
{ 
  tools.TrovaRime(RIMARIO, req.body.lemma, function(result)
  {
     var rData = {RIMARIO:result}; 
     var page = fs.readFileSync(__dirname + '/public/Home.html', "utf8");

     if (rData.RIMARIO[0].Nrime == 0) res.redirect("/NoRime.html");
     else
     {
         var html = mustache.to_html(page, rData); // riempie i dati del modello
         res.send(html); 
     }
  });
});


app.post('/sillabazione', function(req, res) 
{
  tools.Sillabazione(req.body.lemma, function(result)
  {  
     var rData = {risposta:result, parola:req.body.lemma};
     //console.log(JSON.stringify(rData));
     var page = fs.readFileSync(__dirname + '/public/Sillabo.html', "utf8");

     var html = mustache.to_html(page, rData); // riempie i dati del modello
     res.send(html); 
  });
});

 
