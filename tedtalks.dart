#library('tedtalks');

#import('dart:io');
#import('dart:uri');
#import('dart:json');
#import('dart:crypto');

#import('package:html5lib/html5parser.dart', prefix: 'html5parser');
#import('package:html5lib/dom.dart');

final talksListUrl = 'http://www.ted.com/talks/quick-list';

JSON jsonFromHtmlDocument(theDocument) {
  final videoTable = theDocument.queryAll('table').filter((Element element) {
    return element.attributes['class'].contains('downloads');
  })[0];


  final talkFromRow = (Element row) {
    List<Element> columns = row.queryAll('td');
    Map<String, String> talk;

    if (columns.length > 0) {
      final pageLink = columns[2].query('a');
      final talkTitle = pageLink.innerHTML;
      final talkUrl = pageLink.attributes['href'];
      final downloadLinks = columns[4].queryAll('a');
      final downloadLow = downloadLinks.length > 0 ? downloadLinks[0].attributes['href'] : '';
      final downloadMed = downloadLinks.length > 1 ? downloadLinks[1].attributes['href'] : '';
      final downloadHigh = downloadLinks.length > 2 ? downloadLinks[2].attributes['href'] : '';

      SHA1 sha1 = new SHA1();
      final idDigest = sha1.update(talkUrl.charCodes()).digest();
      final id = CryptoUtils.bytesToHex(idDigest);

      talk = {
        'id': id,
        'published': columns[0].innerHTML,
        'event': columns[1].innerHTML,
        'title': talkTitle,
        'talkUrl': talkUrl,
        'duration': columns[3].innerHTML,
        'downloadLow': downloadLow,
        'downloadMed': downloadMed,
        'downloadHigh': downloadHigh
      };
    }

    return talk;
  };

  return videoTable.queryAll('tr').map(talkFromRow);
}

void main() {
  var client = new HttpClient();
  var connection = client.getUrl(new Uri(talksListUrl));

  connection.onResponse = (HttpClientResponse response) {
    var input = new StringInputStream(response.inputStream);
    var htmlText = '';

    input.onData = () {
      htmlText = htmlText.concat(input.read());
    };

    response.inputStream.onClosed = () {
      client.shutdown();

      var theDocument = html5parser.parse(htmlText);
      JSON tedtalkVideos = jsonFromHtmlDocument(theDocument);
      print(JSON.stringify(tedtalkVideos));
    };
  };
}