(function(){
  var btn = document.getElementById('back-to-top');
  if (btn) {
    function onScroll(){
      if (window.scrollY > 300) { btn.classList.add('show'); } else { btn.classList.remove('show'); }
    }
    window.addEventListener('scroll', onScroll);
    btn.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  try { history.scrollRestoration = 'manual'; } catch(e){}

  function saveScroll(){
    try {
      var state = history.state || {};
      state.scrollY = window.scrollY;
      history.replaceState(state, document.title, window.location.href);
      // also persist per-path for forward navigations
      var path = window.location.pathname + (window.location.search || '');
      sessionStorage.setItem('scroll:' + path, String(window.scrollY));
    } catch(e){}
  }
  document.addEventListener('htmx:beforeRequest', saveScroll);

  document.addEventListener('htmx:pushedIntoHistory', function(){
    try {
      var state = history.state || {};
      state.scrollY = 0;
      history.replaceState(state, document.title, window.location.href);
    } catch(e){}
  });

  var isRestoring = false;
  document.addEventListener('htmx:historyRestore', function(){
    isRestoring = true;
    requestAnimationFrame(function(){
      var y = (history.state && typeof history.state.scrollY === 'number') ? history.state.scrollY : 0;
      window.scrollTo(0, y);
      isRestoring = false;
    });
  });

  document.addEventListener('htmx:afterSwap', function(evt){
    if (evt && evt.target && evt.target.id === 'app-root') {
      if (isRestoring) return; // handled in historyRestore
      var isHome = !!document.querySelector('#app-root .blog');
      if (isHome) {
        var saved = sessionStorage.getItem('scroll:' + '/');
        var y = saved ? parseInt(saved, 10) : 0;
        window.scrollTo(0, isNaN(y) ? 0 : y);
      } else {
        window.scrollTo(0, 0);
      }
    }
  });
})();

