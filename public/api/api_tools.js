var bc = require('bitcoin');
var postgre = require('pg');
var client = new postgre.Client("postgres://<username>:<password>@localhost:5432/bcexchange");
client.connect();
var bc_client = new bc.Client({
  host: 'localhost',
  port: 2240, 
  user: '<user>', // declared in bcexchange.conf and invoked here
  pass: '<pass>', // declared in bcexchange.conf and invoked here
  timeout: 30000
});

module.exports = {
  bitcoinClient:bc_client,
  psqlClient:client,
  convertJSONarray:convertJSONarray,
  isAlphaNumeric:isAlphaNumeric,
  isNumeric:isNumeric,
  appear:appear
};

function appear(a,i){
 var result = 0;
 for(var o in a)
  if(a[o] == i)
   result++;
 return result;
}


function convertJSONarray(s){

  var step1 = s.replace(/"{/g,'{').replace(/}"/g,'}').replace(/\\/g,"");
  var step2 = "[" + step1.slice(1,-1) + "]";
  var step3 = JSON.parse(step2);
  return step3;


}; 

function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

function isNumeric(str) {
    var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58)) { // numeric (0-9)
      return false;
    }
  }
  return true;
    
};