TEDTalks JSON
=============

tedtalks-json is a small Dart project that extracts the Talks listed at http://www.ted.com/talks/quick-list
and outputs the information in JSON format. 


tedtalks.dart
-------------
Builds the JSON.
First install dependencies by running `pub install`.
Then run `dart tedtalks.dart`.


tedtalks.json
-------------
The latest JSON output.


Notes on the JSON
-----------------
An additional slot, 'id', appears in the JSON. This value is the SHA1 hexadecimal representation of the Talk's title.