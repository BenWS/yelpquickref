var myFunction = function(category) {

    var myArray = 
    
        {'restaurants':
        	['brazilian',
        	'french',
        	'indpak',
        	'italian',
        	'japanese',
        	'bbq ',
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
        
    var selection
        
    if (category == 'restaurants') {
        var randomNumber = Math.ceil(Math.random() * parseInt(myArray.restaurants.length));
        selection = myArray.restaurants[randomNumber - 1];
    }
    
    if (category == 'nightlife') {
        var randomNumber = Math.ceil(Math.random() * parseInt(myArray.nightlife.length));
        selection = myArray.nightlife[randomNumber - 1];
    }
    
    if (category == 'arts_entertainment') {
        var randomNumber = Math.ceil(Math.random() * parseInt(myArray.arts_entertainment.length));
        selection = myArray.arts_entertainment[randomNumber - 1];
    }
    return selection;
}

console.log(myFunction('nightlife'));

