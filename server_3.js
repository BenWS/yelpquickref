/* require the modules needed */
var oauthsignature = require('oauth-signature');
var n = require('nonce')();
var request = require('request');
var qs = require('querystring');
var _ = require('lodash');
var express = require('express');
var pug = require('pug');
var app = express();

var request_yelp = function(set_parameters, callback) {

  /* The type of request */
  var httpMethod = 'GET';

  /* The url we are using for the request */
  var url = 'http://api.yelp.com/v2/search';

  /* We can setup default parameters here */
  var default_parameters = {
    sort: '2'
  };

   //setting require parameters here
    var required_parameters = {
        oauth_consumer_key : 'c1hefHp0HHEJegsWH3zwlw',
        oauth_token : 'GaeAzv0VANc4rKSh9ZulDExe-E8HwtoT',
        oauth_nonce : n(),
        oauth_timestamp : n().toString().substr(0,10),
        oauth_signature_method : 'HMAC-SHA1',
        oauth_version : '1.0'
    }
    
    var parameters = _.assign(default_parameters, set_parameters, required_parameters);
  
    var consumerSecret = 'ESBUx5UnnP2Yg5qrjsZRZiugBbM';
    var tokenSecret = 'sV3cVBl7xkxorRarStHwtm9Ucrg';
    var signature = oauthsignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, { encodeSignature: false});
    
    parameters.oauth_signature = signature;
    
    var paramURL = qs.stringify(parameters);
    
    console.log("Search Query " + paramURL);
    
    var apiURL = url + '?' + paramURL;

  /* Then we use request to send make the API Request */
  request(apiURL, function(error, response, body){
    return callback(error, response, body);
  });
}

request_yelp({offset:'0', location:30506, category_filter:"movietheaters", radius_filter:8000}, (err, res, body) => {
     console.log(JSON.parse(body))
})