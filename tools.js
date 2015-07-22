
module.exports =
{
    //Recupera dal Sabatini-Coletti la stringa di testo che descrive il lemma passato come parametro
    Definizione: function (parola, callback)
    {
        var removeDiacritics = require('diacritics').remove;
        var changeCase = require('change-case');
        var http = require('http');
        var YQL = require("yql");

    	var stringa = "";
   	parola = removeDiacritics(parola);
    	var url = "http://dizionari.corriere.it/dizionario_italiano/" + changeCase.upperCase(parola[0]) + "/" + changeCase.lowerCase(parola) + ".shtml";

	http.get(url, function(res) 
   	{
                //non viene fatto nessun controllo sulla buona riuscita della chiamata, il dizionario è costruito solo con lemmi che è garantito siano presenti
        	new YQL.exec('select * from htmlstring where url="'+url+'" and  xpath ="//div/h1/..//ul/.."', function(response) 
        	{     
           		callback(response.query.results.result);
        	});
   	});
    },


    //Recupera dal Sabatini-Coletti un oggetto JSON e ne estrae l'elemento che riporta la sillabazione del lemma
    Sillabazione: function (parola, callback)
    {
        var removeDiacritics = require('diacritics').remove;
        var changeCase = require('change-case');
        var http = require('http');
        var YQL = require("yql");
        var util = require("util");

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
                        //per le parole con più accezioni, come 'fare', il sito del Corriere adotta una codifica del tipo 'fare_1', 'fare_2' eccetera 
         		url = url.replace(".shtml", "_1.shtml");
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
    },

    TrovaRime: function(RIMARIO, parola, callback) 
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
                 //cerca nel file rimario.json l'elemento con chiave richiesta 
                 risp = RIMARIO[sottostringa];
                 rappresentante = sottostringa;             
                 count = RIMARIO[sottostringa].length;
             }   
         }

         var elenco = [];
         for (i = 0; i < count; i++) elenco.push({"rima" : risp[i]}); 

         var responso = [];

         //costruisce un oggetto JSON adatto ad essere mostrato nella pagina ElencoRime.html
         responso.push({"Nrime" : count});
         responso.push({"rappresentante" : rappresentante});
         responso.push({"rime" : elenco})

        callback(responso);  
    }
};
