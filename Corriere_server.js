var http = require('http');
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
           console.log(JSON.stringify(rispondone));
    
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

 function processa(request, response)
 { 
   response.writeHead(200, {'Content-Type', 'text/html; charset=utf-8'});  
    Corriere(req.body.name, function(result){
    response.write("Sillabazione di '" + req.body.name + "': "+ result);  }); 
    response.end();  
 }  
 
var port =  process.env.OPENSHIFT_NODEJS_PORT || 8080;   // Port 8080 if you run locally   
var address =  process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"; // Listening to localhost if you run locally   
   
var s = http.createServer(processa);   
s.listen(port, address);   



