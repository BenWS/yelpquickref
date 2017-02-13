var oauthsignature = require('oauth-signature');
var n = require('nonce')();
var request = require('request');
var qs = require('querystring');
var _ = require('lodash');
var express = require('express');
var pug = require('pug');
var app = express();


/*************************
 * Defining Functions Here
 * ***********************/

//query YELP search API 

var search_request = function(set_parameters, callback) {
   
    var httpMethod = 'GET';
    var url = 'https://api.yelp.com/v2/search/';
    
    //setting default parameters
    var default_parameters = {
        //setting the below in function method
        // location:'San Franscisco, CA'
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

    request(apiURL, function(error, response, body) {
        return callback(error, response, body);
    })
}
//set view directory
app.set("views", "./views");
app.set("view engine", "pug");

app.get('/index', (request,response) => {
    response.render('index.pug')
})

/****
 * 2-12-17
TO BE DEVELOPED: Catch for no businesses found 

Process I have in mind:
1) Remove requirement for the listed categories
2) Remove radius requiremnent, mention removal on page
3) Return 'No results found' on page, and then provide link to the index page for new query
****/


/****
 * 2-12-17
TO BE DEVELOPED: Link on results page to index page

*/

app.get('/results', (request,response) => {
    
    if (request.query.category == '-') {
        response.redirect('/index');
    }
    
    /****************************************
     * Search for Selected Category
     * 
     * The below outputs an array of data given
     * the users base category selection
     ***************************************/
    
    var randomNumber
    var userSelection = request.query.category;
    var selectedLocation = request.query.location;
    var radius = request.query.radius;
    var isValidResponse = false;
    //options for category selector function:
    //restaurant, arts_entertainment, nightlife
    
    var categoryArray = 
    
        {'restaurants':
        	['brazilian',
        	'french',
        	'indpak',
        	'italian',
        	'japanese',
        	'bbq',
        	'cheesesteaks',
        	'chinese',
        	'mexican'],
        
        'nightlife':
        
        	['barcrawl',
        	'pubs',
        	'beerbar',
        	'comedyclubs',
        	'karaoke',
        	'movietheaters'],
        
        'arts_entertainment':
        
        	['social_clubs',
        	'galleries',
        	'museums']
        }
    
    var selection;
        
    if (userSelection == 'restaurants') {
        randomNumber = Math.ceil(Math.random() * parseInt(categoryArray.restaurants.length));
        selection = categoryArray.restaurants[randomNumber - 1];
    }
    
    if (userSelection == 'nightlife') {
        randomNumber = Math.ceil(Math.random() * parseInt(categoryArray.nightlife.length));
        selection = categoryArray.nightlife[randomNumber - 1];
    }
    
    if (userSelection == 'arts_entertainment') {
        randomNumber = Math.ceil(Math.random() * parseInt(categoryArray.arts_entertainment.length));
        selection = categoryArray.arts_entertainment[randomNumber - 1];
    }
    
    // generic url param argument replaces orignally specified variables (below)
    // {location:'30506', category_filter:"korean", radius_filter:8000}
    search_request ({category_filter:selection, location:selectedLocation, radius_filter:radius}, (err, res, body) => {
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
                    
            if(randomBusiness == 0) {
                //passing offset integer 0 to search method results in INVALID SIGNATURE error -- correcting here
                randomBusiness = '0'
            } 
            
            console.log('Random Number Selected: ' + randomBusiness);
            search_request({category_filter:selection, offset: randomBusiness, location:selectedLocation, radius_filter:radius}, (err, res, body) => {
                var resultBody = JSON.parse(body);
                
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
                  
                response.render("results", {results:resultsData});
            });
            
        } else {
            //search #2; generic parent category search
            //in server.js file category filter here is set by 'var userSelection = req.query.category' (userSelection set above)
            search_request ({category_filter:userSelection, location:selectedLocation, radius_filter:radius}, (err, res, body) => {
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
                    
                     if(randomBusiness == 0) {
                        //passing offset integer 0 to search method results in INVALID SIGNATURE error -- correcting here
                        randomBusiness = '0'
                     } 
                    
                    console.log('Random Number Selected: ' + randomBusiness);
                    search_request({category_filter:userSelection, offset: randomBusiness, location:selectedLocation, radius_filter:radius}, (err, res, body) => {
                        var resultBody = JSON.parse(body);
                        
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
                          
                        response.render("results", {results:resultsData})
                        console.log(resultsData.toString())
                        
                    });
                } else {
                    //search #3: removes radius from search queries
                    search_request ({category_filter:userSelection, location:selectedLocation}, (err, res, body) => {
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
                                    
                            if(randomBusiness == 0) {
                                //passing offset integer 0 to search method results in INVALID SIGNATURE error -- correcting here
                                randomBusiness = '0'
                            } 
                            
                            console.log('Random Number Selected: ' + randomBusiness);
                            search_request({category_filter:userSelection, offset: randomBusiness, location:selectedLocation}, (err, res, body) => {
                                var resultBody = JSON.parse(body);
                    
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
                                  
                                response.render("results", {results:resultsData})
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
});

app.get('/*', (request, response) => {
    response.redirect('/index');
})

app.listen(8080);