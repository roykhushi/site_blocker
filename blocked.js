document.addEventListener('DOMContentLoaded', function() {
    
    const urlParams = new URLSearchParams(window.location.search);
    const site = urlParams.get('site');
    
    if (site) {
      document.getElementById('blocked-site').textContent = site;
    }
    
    document.getElementById('go-back').addEventListener('click', function() {
      history.back();
    });
  });