var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
var changeCase = require('change-case');
var YQL = require("yql");

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  //console.log('server listening on port ' + app.get('port'));
});

function Corriere (parola, callback)
{
    var stringa = "";

    var url = "http://dizionari.corriere.it/dizionario_italiano/" + changeCase.upperCase(parola[0]) + "/" + parola + ".shtml";

   http.get(url, function(res) 
   {
     //console.log("statusCode: ", res.statusCode); 
     if (res.statusCode == 200)
     {
        new YQL.exec('select * from html where url="'+url+'" and  xpath ="//div/h5//strong"', function(response) 
        {      
           var risposta_corriere = response.query.results.strong; 
           //console.log(JSON.stringify(risposta_corriere));
    
          if(risposta_corriere[0][0] == '[') 
          {
              for(i = 1; i < risposta_corriere[0].length - 1; i++)
              {
                   stringa += (risposta_corriere[0][i]);
                   //console.log("Work in progress:  " + stringa);
              }
          }
          else stringa = "Termine straniero o sillabazione non disponibile.";
       
           callback(stringa);
         });
     }
     else callback("La pagina non esiste. Provare ad aggiungere _1 alla parola richiesta."); 

   });

}

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', function(req, res) 
{
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
 
  Corriere(req.body.name, function(result){
    res.send("Sillabazione di '" + req.body.name + "': "+ result);  });   
});










