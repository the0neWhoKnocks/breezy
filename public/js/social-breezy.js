function Breezy(opts){
  this.opts = opts || {};
  
  this.opts.highlightChanges = this.opts.highlightChanges || true;
  
  this.els = {};
  this.replacementRules = {
    '/Trump(?![\\w-/])/': 'Drumpf',
    '/porn(?![\\w-/])/i': 'poop|pork',
    '/struggle(?![-/])/i': 'cuddle',
    '/kill(?!\\w+[-/])/i': 'kiss',
    '/pain(?!\\w+[-/])/i': 'joy',
    '/disaffected(?![\\w-/])/i': 'napping',
    '/Republicans(?![\\w-/])/': 'politically confused people',
    '/brutal(?![\\w-/])/i': 'gentle',
    '/murder(?![\\w-/])/i': 'hugging',
    '/murdered(?![\\w-/])/i': 'hugged',
    '/fight(?![\\w-/])/i': 'cuddle|massage',
    '/jailed(?![\\w-/])/i': 'placed in a room filled with puppies',
    '/assault(?![\\w-/])/i': 'tickles',
    '/rape(?![\\w-/])/i': 'love',
    '/strangled(?![\\w-/])/i': 'tickled',
    '/set on fire(?![\\w-/])/i': 'covered in marshmallows',
  };
  
  if( this.opts.autoInit ) init();
}

Breezy.prototype = {
  init: function(){
    this.addStyles();
    
    document.querySelectorAll('.breezy-btn').forEach(function(el){
      el.innerHTML += '<img class="js-breezyIcon" src="/imgs/icon-breezy-sml.svg"><img class="breezy-btn__floater js-breezyFloater" src="/imgs/icon-breezy-sml.svg">';
      
      var icon = el.querySelector('.js-breezyIcon');
      this.els.floater = el.querySelector('.js-breezyFloater');
      this.els.floater.setAttribute('style', this.els.floater.getAttribute('style')||'' +"top:"+ icon.offsetTop +"px; left:"+ icon.offsetLeft +"px;");
      
      el.addEventListener('click', this.handleClick.bind(this));
    }.bind(this));
  },
  
  addStyles: function(){
    if( !document.querySelector('style#breezyStyles') ){
      document.head.innerHTML +=
        '<style id="breezyStyles">'+
          '.breezy-btn {'+
            'color: #556F7A;'+
            'line-height: 1.5em;'+
            'font-size: 1.25em;'+
            'font-weight: bold;'+
            'font-style: italic;'+
            'text-decoration: none;'+
            'padding: 0px 4px 0px 6px;'+
            'border: solid 1px #9FBBC4;'+
            'background: #BEDAE5;'+
            'display: inline-block;'+
            'border-radius: 3px;'+
            'outline: 0;'+
            'vertical-align: middle;'+
            'position: relative;'+
            'cursor: pointer;'+
          '}'+
          '.breezy-btn:focus {'+
            'outline: 0;'+
          '}'+
          '.breezy-btn img {'+
            'height: 30px;'+
            'padding-left: 4px;'+
            'display: inline-block;'+
            'vertical-align: top;'+
          '}'+
          '.breezy-btn__floater {'+
            'opacity: 0;'+
            'position: absolute;'+
            'z-index: 10;'+
          '}'+
          '.breezy-btn__floater.is--floating {'+
            'animation: float 1s;'+
          '}'+
          '@keyframes float {'+
            '0% {'+
              'opacity: 0;'+
            '}'+
            '50% {'+
              'opacity: 1;'+
            '}'+
            '100% {'+
              'opacity: 0;'+
              'transform: translate(+1em, -1em);'+
            '}'+
          '}'+
        '</style>';
    }
  },
  
  bool: function(val){
    return val === 'true';
  },
  
  handleClick: function(ev){
    ev.preventDefault();
    ev.stopImmediatePropagation();
    var btn = ev.currentTarget;
    
    this.els.floater = btn.querySelector('.js-breezyFloater');
    this.animationEndRef = this.handleAnimationEnd.bind(this);
    
    this.els.floater.removeEventListener('animationend', this.animationEndRef);
    this.els.floater.classList.remove('is--floating');
    
    this.els.floater.addEventListener('animationend', this.animationEndRef);
    this.els.floater.classList.add('is--floating');
    
    if( !this.bool(btn.dataset.converting) ){
      btn.dataset.converting = true;
      this.makeItBreezy(btn);
    }
  },
  
  handleAnimationEnd: function(ev){
    this.els.floater.removeEventListener('animationend', this.animationEndRef);
    this.els.floater.classList.remove('is--floating');
    delete this.animationEndRef;
  },
  
  random: function(items){
    return items[Math.floor(Math.random()*items.length)];
  },
  
  wrapText: function(text){
    var styles = ( this.opts.highlightChanges )
      ? ' style="color:#556F7A; font-weight:bold; padding:0.1em 0.5em; border:solid 1px; border-radius:0.3em; display:inline-block; background:#BEDAE5;"'
      : '';
    
    return '<span'+ styles +'>'+ text +'</span>';
  },
  
  convertText: function(text, type){
    for(var rule in this.replacementRules){
      var regExParts = rule.match(/^\/(.*)\/(.*)?/);
      var regEx = new RegExp(regExParts[1], (regExParts[2] || '')+'gm' );
      var vals = this.replacementRules[rule].split('|');
      var val = this.random(vals);
      
      text = text.replace(regEx, this.wrapText(val));
    }
    
    return text;
  },
  
  makeItBreezy: function(btn){
    var el = document.querySelector(btn.dataset.src);
    
    switch(el.nodeName){
      case 'IFRAME':
        // convert just the body
        var body = (el.contentDocument || el.contentWindow.document).body;
        
        body.innerHTML = this.convertText(body.innerHTML, el.nodeName);
        break;
    }
    
    btn.dataset.converting = false;
  }
};

if( window.breezyOpts ){
  var ctx = window.breezyOpts.ctx || window;
  
  ctx.breezy = new Breezy(window.breezyOpts);
}else{
  window.breezy = new Breezy();
}