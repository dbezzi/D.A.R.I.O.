var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
var changeCase = require('change-case');
var YQL = require("yql");

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
           var rispondone = response.query.results.strong; 
           //console.log(JSON.stringify(rispondone));
    
          if(rispondone[0][0] == '[') 
          {
              for(i = 1; i < rispondone[0].length - 1; i++)
              {
                   stringa += (rispondone[0][i]);
                   //console.log("ne ho preso uno! Guarda qua:   " + stringa);
              }
          }
          else stringa = "Termine straniero, sillabazione non disponibile. Lamentatevi col Corriere";
       
           callback(stringa);
         });
     }
     else callback("la pagina non esiste"); 

   });

}

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/myaction', function(req, res) 
{
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
 
  Corriere(req.body.name, function(result){
    res.send("Sillabazione di '" + req.body.name + "': "+ result);  });   
});

app.set('address', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, function()
{ console.log(app.get('address'));
  console.log('Sto ascoltando...');
});





