'use strict';

//Inject HTML with data onto webpage
function postBeerInfo(beername, overall, style, url) {
  $('div.product-image').first().prepend(
    '<div class="row"><div class="col-xs-5 col-sm-4 col-md-12"><a href="'+ url +'" target="_blank"> <div style="background-color: #00346A; color:white; border-radius: 40px;' +
          'padding:15px;margin-bottom: -150px">' +
      '<img src="'+chrome.extension.getURL("images/rblogo.png") +'" alt="" style="width:65%; height:10%;">' +
      '<h1 style="font-size:19px">' + beername + '</h1>' +
      '<h2 style="font-size:18px"> Overall: ' + overall + ' Style: ' + style +'</h2>' +
    '</div></a></div></div>');

}

//Get specific data about a beer (webscraped)
function getBeerInfo(beername, beerlink) {
  var url = 'http://www.ratebeer.com/' + beerlink;
  $.get(url, function(data) {
    var overall = "";
    var style = "";
    var result = $(data).find('#container').find('[itemprop=rating]').find('span').each(function () {
      if($(this).text() === 'overall')
      {
        console.log($(this).next().next().text());
        overall = $(this).next().next().text();
      }
      else if($(this).attr('itemprop') === 'average')
      {
        console.log($(this).text());
        style = $(this).text()
      }
    });
    postBeerInfo(beername, overall, style, url);
  });
}

//Search for the beer on ratebeer(result is webscraped)
function searchBeer(beername) {
  var input = {BeerName : beername};
  var firstHit = "";
  var link = "";
  var foundPerfectMatch = false;
  $.ajax({
    type: 'POST',
    contentType: "application/x-www-form-urlencoded;",
    url: 'http://www.ratebeer.com/findbeer.asp',
    data: input,
    dataType: 'html',
    success: function(data) {
      var result = $(data).find('#container').find('table').find('a').each(function() {

        if($(this).attr('title').includes('View more info on'))
        {

          var resultBeer =($(this).text());
          console.log("found: " + resultBeer);
          if(firstHit === '')
          {
            firstHit = resultBeer;
            link = ($(this).attr('href'));
          }
          if(resultBeer === beername)
          {
            foundPerfectMatch = true;
            link = ($(this).attr('href'));
            console.log('Perfect Match!\n Getting beer info for ' + resultBeer);
            getBeerInfo(resultBeer, link);
          }

        }
      });
      if(!foundPerfectMatch)
      {
        console.log('Getting beer info for first hit, ' firstHit);
        getBeerInfo(firstHit, link);
      }
    }
  });
}

//FIXME: can't searches on ratebeer to work with special character at the moment,
//       so we need to remove these for now...
function removespecials(beer)
{
  var strippedBeer = beer.replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
                         .replace(/Å/g, "A").replace(/Ä/g, "A").replace(/Ö/g, "O")
                         .replace(/Ø/g, "O").replace(/æ/g, "a")
  return strippedBeer;
}


//Get beer name and possible subtitle.
var systemBeer  = $('.name').children('h1').text();
var systemSubTitle = $('.subtitle').children('span').text();
//Remove systemets ID and trim the edges
systemBeer = systemBeer.substring(0,systemBeer.indexOf('(')-1);
var beer = $.trim(systemBeer) + " " + $.trim(systemSubTitle);

//Start search
console.log(removespecials(beer))

searchBeer(removespecials(beer));
