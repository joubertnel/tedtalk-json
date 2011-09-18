TEDTalks JSON
=============

tedtalks-json is a small NodeJS project that extracts the Talks listed at http://www.ted.com/talks/quick-list
and outputs the information in JSON format. 


tedtalks.js
-----------
Builds the JSON using a SAX parser. Fast.


tedtalks-jsdom.js
-----------------
Alternative implementation that builds the JSON using JQuery. Slow.


tedtalks.json
-------------
The resulting JSON.


Notes on the JSON
-----------------
An additional slot, 'id', appears in the JSON. This value is the MD5 hexadecimal representation of the Talk's title.