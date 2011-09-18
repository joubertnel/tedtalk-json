var crypto = require('crypto');
var jsdom = require('jsdom');

/// Config
var tedURL = 'http://ted.com/talks/quick-list';
var talkRowSelectorExpression = 'table.downloads tr';


/// Functions

function makeTalkJSON($, cells) {
  var talkUrl;
  var downloadLow;
  var downloadMed;
  var downloadHigh;
  var downloadLinks = $(cells[4]).find('a');  
  var pageLink = $(cells[2]).find('a')[0];  
  var title = pageLink.innerHTML;
  var id = crypto.createHash('md5').update(title).digest('hex');

  try {
    talkUrl = pageLink.href;
  } catch (e) {}
  
  try {
    downloadLow = downloadLinks[0].href;
  } catch (e) {}

  try {
    downloadMed = downloadLinks[1].href;
  } catch (e) {}

  try {
    downloadHigh = downloadLinks[2].href;
  } catch (e) {}
  

  return { "id": id,
	   "published": cells[0].innerHTML,
	   "event": cells[1].innerHTML,
	   "title": title,
	   "talkUrl": talkUrl,
	   "duration": cells[3].innerHTML,
	   "downloadLow": downloadLow,
	   "downloadMed": downloadMed,
	   "downloadHigh": downloadHigh
	 };
}

function extractTalks($) {
  var rows = $(talkRowSelectorExpression).toArray();
  rows.splice(0, 1); // the first row is the header
  
  var talksJson = rows.map(function(r) {
    var cells = $(r).children().toArray();
    return makeTalkJSON($, cells);
  });

  console.log(talksJson);
}



/// Main

jsdom.env({
  html: tedURL,
  scripts: ['http://code.jquery.com/jquery-1.6.4.min.js'],
  done: function(errors, window) {
    extractTalks(window.$);
  }
});
