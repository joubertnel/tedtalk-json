// Modules
var request = require('request');
var sax = require('sax');
var http = require('http');
var crypto = require('crypto');

// Globals
var requestOptions = { host: 'www.ted.com',
		       post: 80,
		       path: '/talks/quick-list' };

var parser = sax.parser();
var req;


// Transform to JSON
var isInTalkTable = false;
var isInTalkRow = false;
var isInTalkCol = false;
var currentTalkRow = {};
var currentTalkSlot = {};
var talkJSON = [];
var columnMap = ['published', 'event', 'title', 'duration', 'download'];
var downloadLinkMap = ['downloadLow', 'downloadMed', 'downloadHigh'];
var currentColumn = -1;
var currentDownloadLinkIndex = -1;
var titleHyperlinkColumnIndex = 2;
var downloadsColumnIndex = 4;

function isTalkTableNode(node) {
  var isTable = node.name === 'TABLE';
  var tableIsTaggedDownloads = isTable && node.attributes.CLASS && node.attributes.CLASS.indexOf('downloads') !== -1;	      
  return tableIsTaggedDownloads;
}

function isTalkRowNode(node) {
  return node.name === 'TR';
}

function isTalkColNode(node) {
  return node.name === 'TD';
}

parser.ontext = function(text) {
  var isInDownloadColumn = currentColumn === downloadsColumnIndex;
  if (isInTalkCol && !isInDownloadColumn) {
    currentTalkRow[currentTalkSlot.name] = text;
  }
}

parser.onopentag = function(node) {
  // Determine whether we're in a cell in the Talks table
  if (isTalkTableNode(node)) {
    isInTalkTable = true;
  }

  if (isInTalkTable) {
    if (isTalkRowNode(node)) {
      isInTalkRow = true;
    }

    if (isInTalkRow) {
      if (isTalkColNode(node)) {
	isInTalkCol = true;
	currentColumn++;
      }

      if (isInTalkCol) {
	currentTalkSlot = { 'name': columnMap[currentColumn] };

	if (currentColumn === titleHyperlinkColumnIndex) {
	  if (node.name === 'A') {
	    currentTalkRow['talkHome'] = node.attributes['HREF'];
	    // Create an ID for the JSON record, which is an MD5 hash of the Talk home URL
	    currentTalkRow['id'] = crypto.createHash('md5').update(currentTalkRow['talkHome']).digest('hex');
	  }
	}

	if (currentColumn === downloadsColumnIndex) {
	  if (node.name === 'A') {
	    currentDownloadLinkIndex++;
	    currentTalkRow[downloadLinkMap[currentDownloadLinkIndex]] = node.attributes['HREF'];
	  }
	}
      }
    }
  }
}

parser.onclosetag = function(nodeName) {
  if ((nodeName === 'TD') && isInTalkCol) {
    isInTalkCol = false;
  }
  
  if ((nodeName === 'TR') && isInTalkRow) {    
    talkJSON.push(currentTalkRow);
    currentTalkRow = {};
    isInTalkRow = false;
    currentColumn = -1;
    currentDownloadLinkIndex = -1;
  }
  
  if (nodeName === 'TABLE') {
    isInTalkTable = false;
    console.log(talkJSON);
  }
  
}



// Main
http.get(requestOptions, function(response) {
  var theHtml;

  response.on('data', function(chunk) {
    theHtml = theHtml + chunk;    
  });

  response.on('end', function() {
    theHtml = theHtml.replace(/[\t\n]/gi, ''); // clean up the HTML
    parser.write(theHtml).close();    
  });

  
});



