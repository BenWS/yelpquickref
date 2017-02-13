/* require the modules needed */
var oauthsignature = require('oauth-signature');
var n = require('nonce')();
var request = require('request');
var qs = require('querystring');
var _ = require('lodash');
var express = require('express');
var pug = require('pug');
var app = express();

//setting variables used within request_yelp function calls
// {location:'30506', category_filter:"korean", radius_filter:8000}

var selectedLocation = 30506;
var selection = "korean";
var radius = 8000;

//parent category to category_filter
var userSelection = "restaurants";

/* Function for yelp call
 * ------------------------
 * set_parameters: object with params to search
 * callback: callback(error, response, body)
 */
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

};


//search #1; all parameters included
// generic url param argument replaces orignally specified variables (below)
// {location:'30506', category_filter:"korean", radius_filter:8000}
request_yelp ({category_filter:selection, location:selectedLocation, radius_filter:radius}, (err, res, body) => {
    var responseBody = JSON.parse(body);
    
    if (JSON.parse(body).businesses.length > 0) {
        //process
        console.log('search #1 processed')
        var seedValue;
        var body = JSON.parse(body);
        
        //take this total and use within random number generator
        //check the case of the body.total value being greater than 1000
        
        if (body.total >= 1000) {
            seedValue = 1000;
        } else {
            seedValue = body.total
        }
        
        var randomBusiness = 
            Math.floor(
                Math.random() * parseInt(seedValue));
        
        console.log('Random Number Selected: ' + randomBusiness);
        request_yelp({category_filter:selection, offset: randomBusiness + 1, location:selectedLocation, radius_filter:radius}, (error, response, body) => {
            var resultBody = JSON.parse(body);
            
            if (resultBody.businesses[0]) {

                var result = resultBody.businesses[0];
                console.log('Business ID: ' + result["id"]);
                var categories = '';
                var categories_slice;
                for (var i = 0; i <= result["categories"].length - 1; i++) {
                    categories = result["categories"][i][0] + ', ' + categories
                    console.log('Categories:' + result["categories"][i][0]);
                }
                
                categories_slice = categories.substr(0, categories.length - 2)
                
                //image 
                var imageResult
                if(result["image_url"]) {
                    imageResult = result["image_url"].replace('ms.jpg','o.jpg')
                } else {
                    imageResult = "https://preview.c9users.io/benws/expressjs/yelpQuickRef/views/no-icon-available_68024.png"
                }
        
                var city = result["location"]["city"] 
                    + ', ' + result["location"]["state_code"]
                    + ' ' + result["location"]["postal_code"]
                    
                var address = result["location"]["address"][0]
                
                var resultsData = {
                    name:result["name"], 
                    yelp_url:result["url"], 
                    reviewCount:result["review_count"], 
                    rating:result["rating"], 
                    categories:categories_slice,
                    image:imageResult,
                    phone:result["display_phone"],
                    address:address,
                    city:city,
                    searchCategory:userSelection,
                    searchLocation:selectedLocation,
                    searchRadius:radius
                }
                  
                // include me when I'm put back into to the server.js program  
                // res.render("results", {results:resultsData})
                console.log(resultsData.toString())
            }
        });
        
    } else {
        //search #2; generic parent category search
        //in server.js file category filter here is set by 'var userSelection = req.query.category' (userSelection set above)
        request_yelp ({category_filter:userSelection, location:selectedLocation, radius_filter:radius}, (err, res, body) => {
            if (JSON.parse(body).businesses.length > 0) {
                //process
                console.log('search #2 processed');
                var seedValue;
                var body = JSON.parse(body);
                
                //take this total and use within random number generator
                //check the case of the body.total value being greater than 1000
                
                if (body.total >= 1000) {
                    seedValue = 1000;
                } else {
                    seedValue = body.total
                }
                
                var randomBusiness = 
                    Math.floor(
                        Math.random() * parseInt(seedValue));
                
                console.log('Random Number Selected: ' + randomBusiness);
                request_yelp({category_filter:userSelection, offset: randomBusiness + 1, location:selectedLocation, radius_filter:radius}, (error, response, body) => {
                    var resultBody = JSON.parse(body);
                    
                    if (resultBody.businesses[0]) {
        
                        var result = resultBody.businesses[0];
                        console.log('Business ID: ' + result["id"]);
                        var categories = '';
                        var categories_slice;
                        for (var i = 0; i <= result["categories"].length - 1; i++) {
                            categories = result["categories"][i][0] + ', ' + categories
                            console.log('Categories:' + result["categories"][i][0]);
                        }
                        
                        categories_slice = categories.substr(0, categories.length - 2)
                        
                        //image 
                        var imageResult
                        if(result["image_url"]) {
                            imageResult = result["image_url"].replace('ms.jpg','o.jpg')
                        } else {
                            imageResult = "https://preview.c9users.io/benws/expressjs/yelpQuickRef/views/no-icon-available_68024.png"
                        }
                
                        var city = result["location"]["city"] 
                            + ', ' + result["location"]["state_code"]
                            + ' ' + result["location"]["postal_code"]
                            
                        var address = result["location"]["address"][0]
                        
                        var resultsData = {
                            name:result["name"], 
                            yelp_url:result["url"], 
                            reviewCount:result["review_count"], 
                            rating:result["rating"], 
                            categories:categories_slice,
                            image:imageResult,
                            phone:result["display_phone"],
                            address:address,
                            city:city,
                            searchCategory:userSelection,
                            searchLocation:selectedLocation,
                            searchRadius:radius
                        }
                          
                        // include me when I'm put back into to the server.js program  
                        // res.render("results", {results:resultsData})
                        console.log(resultsData.toString())
                    }
                });
            } else {
                //search #3: removes radius from search queries
                request_yelp ({category_filter:userSelection, location:selectedLocation}, (err, res, body) => {
                    if (JSON.parse(body).businesses.length > 0) {
                        //process
                        console.log('search #3 processed');
                        var seedValue;
                        var body = JSON.parse(body);
                        
                        //take this total and use within random number generator
                        //check the case of the body.total value being greater than 1000
                        
                        if (body.total >= 1000) {
                            seedValue = 1000;
                        } else {
                            seedValue = body.total
                        }
                        
                        var randomBusiness = 
                            Math.floor(
                                Math.random() * parseInt(seedValue));
                        
                        console.log('Random Number Selected: ' + randomBusiness);
                        request_yelp({category_filter:userSelection, offset: randomBusiness + 1, location:selectedLocation}, (error, response, body) => {
                            var resultBody = JSON.parse(body);
                            
                            if (resultBody.businesses[0]) {
                
                                var result = resultBody.businesses[0];
                                console.log('Business ID: ' + result["id"]);
                                var categories = '';
                                var categories_slice;
                                for (var i = 0; i <= result["categories"].length - 1; i++) {
                                    categories = result["categories"][i][0] + ', ' + categories
                                    console.log('Categories:' + result["categories"][i][0]);
                                }
                                
                                categories_slice = categories.substr(0, categories.length - 2)
                                
                                //image 
                                var imageResult
                                if(result["image_url"]) {
                                    imageResult = result["image_url"].replace('ms.jpg','o.jpg')
                                } else {
                                    imageResult = "https://preview.c9users.io/benws/expressjs/yelpQuickRef/views/no-icon-available_68024.png"
                                }
                        
                                var city = result["location"]["city"] 
                                    + ', ' + result["location"]["state_code"]
                                    + ' ' + result["location"]["postal_code"]
                                    
                                var address = result["location"]["address"][0]
                                
                                var resultsData = {
                                    name:result["name"], 
                                    yelp_url:result["url"], 
                                    reviewCount:result["review_count"], 
                                    rating:result["rating"], 
                                    categories:categories_slice,
                                    image:imageResult,
                                    phone:result["display_phone"],
                                    address:address,
                                    city:city,
                                    searchCategory:userSelection,
                                    searchLocation:selectedLocation,
                                    searchRadius:radius
                                }
                                  
                                // include me when I'm put back into to the server.js program  
                                // res.render("results", {results:resultsData})
                                console.log(resultsData.toString())
                            }
                        });
                    } else {
                        //send user to 'No Results Page'
                        console.log('No Results')
                    }
                })
            }
        })
    }
    
    console.log(responseBody);
})

//?location=30506&radius_filter=8000&category_filter=korean