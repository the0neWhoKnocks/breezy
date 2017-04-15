var graphqlLoc = '/graphql';
var api = graphqlLoc +'?query='
var usersQuery = api + encodeURIComponent('{ rss { url } }');
var headers = new Headers({
  'Content-Type': 'application/graphql'
});
var opts = {
  method: 'GET',
  headers: headers
};
var userQuery;

// =============================================================================

function stripScripts(rawHTML){
  var div = document.createElement('div');
  div.innerHTML = rawHTML;
  var scripts = div.getElementsByTagName('script');
  var i = scripts.length;
  
  while(i--){
    scripts[i].parentNode.removeChild(scripts[i]);
  }
  
  return div.innerHTML;
}

function handleArticlesLoad(articles){
  var html = '';
  
  for(var i=0; i<articles.length; i++){
    var id = 'src'+ (i+1);
    html += 
      '<div class="article">'+
        '<nav><button class="breezy-btn" data-src="#'+ id +'">Float It</button></nav>'+
        '<iframe id="'+ id +'" srcdoc="'+ htmlEncode( stripScripts( htmlDecode(articles[i].html) ) ) +'"></iframe>'+
      '</div>';
  }
  
  document.querySelector('.js-content').innerHTML = html;
  window.breezy.init();
}

// =============================================================================

if( window.fetch ){
  var newsFeedURL = 'http://feeds.foxnews.com/foxnews/latest?format=xml';
  var req = new Request(api + encodeURIComponent('{ feedArticles( url:"'+ newsFeedURL +'", limit:5 ){ html } }'), opts);
  
  fetch(req)
    .then(function(resp){
      resp.json().then(function(resp){
        if( resp.data.feedArticles ){
          handleArticlesLoad(resp.data.feedArticles);
        }else{
          throw new Error('[SERVER] '+ resp.errors[0].message);
        }
      });
    });
}else{
  alert("Can't run in your browser");
}