var express = require('express');
var graphqlHTTP = require('express-graphql');
var buildSchema = require('graphql').buildSchema;
var htmlEncode = require('js-htmlencode').htmlEncode;
var xml2js = require('xml2js-es6-promise');
var request = require('request-promise');
var opn = require('opn');
var portscanner = require('portscanner');
var color = require('cli-color');

var DEFAULT_PORT = 4000;
var port = DEFAULT_PORT;
var OS = function(){
  var platform = process.platform;
  
  if( /^win/.test(platform) ) return 'WINDOWS';
  else if( /^darwin/.test(platform) ) return 'OSX';
  else if( /^linux/.test(platform) ) return 'LINUX';
  else return platform;
}();
var CHROME = function(){
  switch(OS){
    case 'WINDOWS': return 'chrome';
    case 'OSX': return 'google chrome';
    case 'LINUX': return 'google-chrome';
  }
}();
var root = {
  feedArticles: (args) => {
    var articles = [];
    var titles = [];
    var urls = [];
    
    return request(args.url)
      .then(function(resp){
        return xml2js(resp, function(err, result){
          if( err ) throw new Error(err);
          
          return result;
        });
      })
      .then(function(resp){
        // title, link, author, description, pubDate
        var items = resp.rss.channel[0].item;
        var maxItems = args.limit || items.length;
        var requests = [];
        
        for(var i=0; i<maxItems; i++){
          var item = items[i];
          var req = request(item.link[0]);
          titles.push(item.title[0]);
          urls.push(item.link[0]);
            
          requests.push(req);
        }
        
        return Promise.all(requests);
      })
      .then(function(resps){
        for(var i=0; i<resps.length; i++){
          resps[i] = {
            html: htmlEncode(resps[i]),
            title: titles[i],
            url: urls[i]
          };
        }
        
        return resps;
      })
      .catch(function(err){
        console.log('[ERROR]', err);
      });
  }
};
var schema = buildSchema(`
  type FeedArticle {
    html: String,
    title: String,
    url: String
  }
  
  type Query {
    feedArticles(url: String, limit: Int): [FeedArticle]
  }
`);
var expressInst = express();
var server = require('http').createServer(expressInst);

expressInst.use(express.static('public'));
expressInst.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
expressInst.use('/', function(req, res){
  res.sendFile(__dirname +'/public/index.html');
});

var appURL;

function startServer(){
  server.listen(port, function(){  
    appURL = `http://localhost:${ port }/`;
    
    var msg = `${color.green.bold('[ SERVER ]')} Running at ${color.blue.bold(appURL)}`;
    
    console.log(`${msg} \n`);
    
    opn(appURL, {
      app: [CHROME, '--incognito'],
      wait: false // no need to wait for app to close
    });
  });
}

function addServerListeners(){
  // Dynamically sets an open port, if the default is in use.
  portscanner.checkPortStatus(port, '127.0.0.1', function(error, status){
    // Status is 'open' if currently in use or 'closed' if available
    switch(status){
      case 'open' : // port isn't available, so find one that is
        portscanner.findAPortNotInUse(port, port+20, '127.0.0.1', function(error, openPort){
          console.log(`${color.yellow.bold('[PORT]')} ${port} in use, using ${openPort}`);

          port = openPort;
          
          startServer();
        });
        break;
      
      default :
        startServer();
    }
  });
}

addServerListeners();