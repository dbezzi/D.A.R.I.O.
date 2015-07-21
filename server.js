var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
var changeCase = require('change-case');
var removeDiacritics = require('diacritics').remove;
var YQL = require("yql");
var fs = require('fs'); // bring in the file system api
var mustache = require('mustache'); // bring in mustache template engine
var util = require("util");

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var RIMARIO = require("C:\\users\\filippo\\Desktop\\DARIO\\rimario.json");


app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('server listening on port ' + app.get('port'));
});

function Definizione (parola, callback)
{
    var stringa = "";
    parola = removeDiacritics(parola);
    var url = "http://dizionari.corriere.it/dizionario_italiano/" + changeCase.upperCase(parola[0]) + "/" + changeCase.lowerCase(parola) + ".shtml";

   http.get(url, function(res) 
   {
        new YQL.exec('select * from htmlstring where url="'+url+'" and  xpath ="//div/h1/..//ul/.."', function(response) 
        {     
           callback(response.query.results.result);
        });
   });
}

function Sillabazione (parola, callback)
{
    var stringa = "";
    parola = removeDiacritics(parola);
    var url = "http://dizionari.corriere.it/dizionario_italiano/" + changeCase.upperCase(parola[0]) + "/" + changeCase.lowerCase(parola) + ".shtml";

   http.get(url, function(res) 
   {
     //console.log("statusCode: ", res.statusCode); 
     if (res.statusCode == 200)
     {
        new YQL.exec('select * from html where url="'+url+'" and  xpath ="//div/h1/..//strong"', function(response) 
        {      
           var risposta_corriere = response.query.results.strong; 
           //console.log(JSON.stringify(risposta_corriere));
    
          var word = "";
          if (util.isArray(risposta_corriere)) word += risposta_corriere[0];
          else word += risposta_corriere;
           
              if(word[0] == '[') 
              {
                  var i = 1;
               
                  while(word[i] != ']' && word[i] != ' ' && word[i] != ',')
                  {
                       stringa += (word[i]);
                       i++;
                       //console.log("Work in progress:  " + stringa);
                  }
              }
          else stringa = "Termine straniero, sillabazione non disponibile.";
       
          callback(stringa);
         });
     }
     else          
     {   
         url = url.replace(".shtml", "_1.shtml");
         //console.log(url);
         http.get(url, function(res) 
         {
             if (res.statusCode == 200)
             {
                 callback("La parola ha diverse accezioni. Provare a cercare " + parola + "_1, " + parola + "_2 e simili."); 
             }
             else callback("Parola inesistente.");  
         });
     } 
   });
}

function getRime(parola, callback) 
{ 
     var i, count = 0;
     var n = parola.length;
     var risp = "nessuna rima";
     var rappresentante = "NESSUNA RIMA";

     for (i = 1; i <= n; i++)
     {
         var sottostringa = parola.substring(n-i,n);     
         if (RIMARIO.hasOwnProperty(sottostringa)) 
         {
             risp = RIMARIO[sottostringa];
             rappresentante = sottostringa;             
             count = RIMARIO[sottostringa].length;
         }   
     }

     var elenco = [];
     for (i = 0; i < count; i++) elenco.push({"rima" : risp[i]}); 

     var responso = [];

     responso.push({"Nrime" : count});
     responso.push({"rappresentante" : rappresentante});
     responso.push({"rime" : elenco})

    callback(responso);  
}


app.post('/definizione', function(req, res)
{ 
  Definizione(req.body.lemma, function(result)
  {
         res.send(result.replace(/\n/g, "")); // send to client
  });

});


app.post('/', function(req, res)
{ 
  getRime(req.body.lemma, function(result)
  {
     var rData = {RIMARIO:result}; 
     var page = fs.readFileSync("C:\\users\\filippo\\Desktop\\DARIO\\ElencoRime.html", "utf8"); // bring in the HTML file

     if (rData.RIMARIO[0].Nrime == 0) res.sendFile("C:\\users\\filippo\\Desktop\\DARIO\\NoRime.html");
     else
     {
         var html = mustache.to_html(page, rData); // replace all of the data
         res.send(html); // send to client
     }
    });

});

app.post('/sillabazione', function(req, res) 
{
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.charset = 'utf-8';

  var parola = req.body.lemma;
  parola = removeDiacritics(parola.substring(0, parola.length-1)) + parola[parola.length - 1];
  
  Sillabazione(parola, function(result){
    res.send("Sillabazione di '" + parola + "': "+ result);  });
    //  res.send(result);  });    
});










