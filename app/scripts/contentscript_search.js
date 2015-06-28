'use strict';


//Inject HTML with data onto webpage
function postBeerInfo(beername, overall, style, url, element) {
  if(overall !== '' || style !=='')
  {
    element.before(
      '<div style="background-color: #00346A;color: white;position: absolute; bottom: 5px; width: 110px;border-radius: 15px;right: 80px;padding: 0px 5px 0px 5px;">' +
      '<a href=' + url + '>'+
      '<img src="'+chrome.extension.getURL('images/rblogo.png') +'" alt="" style="width: 64%; height:10%;vertical-align:middle;padding-top:3px;">' +
      '<h4 style="float: right; font-weight: bolder; margin-bottom: 10px;font-size:10px">' + overall + '/' + style + '</h4></a></div>');
  }

}

//Get specific data about a beer (webscraped)
function getBeerInfo(beername, beerlink, element) {
  var url = 'http://www.ratebeer.com' + beerlink + '/';
  $.get(url, function(data) {
    var overall = '';
    var style = '';
    $(data).find('#container').find('[itemprop=rating]').find('span').each(function () {
      if($(this).text() === 'overall')
      {
        console.log($(this).next().next().text());
        overall = $(this).next().next().text();
      }
      else if($(this).text() === 'style')
      {
        console.log($(this).prev().prev().text());
        style = $(this).prev().prev().text();
      }
    });
    postBeerInfo(beername, overall, style, url, element);
  });
}

//Search for the beer on ratebeer(result is webscraped)
function searchBeer(beername, element) {
  var input = {BeerName : beername};
  var firstHit = '';
  var link = '';
  var foundPerfectMatch = false;
  $.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded;',
    url: 'http://www.ratebeer.com/findbeer.asp',
    data: input,
    dataType: 'html',
    success: function(data) {
      var error = false;
      $(data).find('#container').find('b').each(function() {
        if($(this).text().includes('0 beers'))
        {
          console.log("errors")
          error = true;
        }
      });
      if(error)
        return;
      $(data).find('#container').find('table').find('a').each(function() {

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
        console.log('Getting beer info for first hit, ' + firstHit );
        getBeerInfo(firstHit, link, element);
      }
    }
  });
}

//FIXME: can't searches on ratebeer to work with special character at the moment,
//       so we need to remove these for now...
function removespecials(beer)
{
  var strippedBeer = beer.replace(/å/g, "a").replace(/ä/g, 'a').replace(/ö/g, 'o')
                         .replace(/Å/g, 'A').replace(/Ä/g, 'A').replace(/Ö/g, 'O')
                         .replace(/Ø/g, 'O').replace(/æ/g, 'a').replace(/&/g, '').replace(/-/g, '');
  return strippedBeer;
}

//Get beer name and possible subtitle.
$('li.show-more-results').on('DOMSubtreeModified', function() {
  console.log("more searches")
  setTimeout(function() {
  $('li.elm-product-list-item-full').each(function() {
    if($(this).find('div.ol').length === 1)
    {
      var beername = $(this).find('span.product-name-bold*').text()
      var additional = $(this).find('span.product-name-thin.xs-show-inline').text()
      var beer = $.trim(beername) + " " + $.trim(additional);
      var element = $(this).find('div.click-area');
      searchBeer(removespecials(beer), element)
    }
  });
}, 500);
})

// var systemSubTitle = $('.subtitle').children('span').text();
// //Remove systemets ID and trim the edges
// systemBeer = systemBeer.substring(0,systemBeer.indexOf('(')-1);
// var beer = $.trim(systemBeer) + " " + $.trim(systemSubTitle);

// //Start search
//searchBeer(removespecials(beer));