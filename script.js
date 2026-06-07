(function () {
  var items = document.querySelectorAll('.subnav-item');
  var panels = document.querySelectorAll('.panel');
  var counter = document.getElementById('subnav-counter');
  var order = ['geo', 'icp'];

  function activate(stream) {
    items.forEach(function (item) {
      item.classList.toggle('is-active', item.dataset.stream === stream);
    });
    panels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.dataset.panel === stream);
    });

    var index = order.indexOf(stream) + 1;
    if (counter) {
      counter.textContent = String(index).padStart(2, '0') + ' / ' + String(order.length).padStart(2, '0');
    }

    var panel = document.getElementById('panel-' + stream);
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      activate(item.dataset.stream);
    });
  });
})();

(function () {
  function sendHeight() {
    var height = document.documentElement.scrollHeight;
    window.parent.postMessage({ source: 'flatpay-process', height: height }, '*');
  }

  window.addEventListener('load', sendHeight);
  window.addEventListener('resize', sendHeight);

  if (window.ResizeObserver) {
    new ResizeObserver(sendHeight).observe(document.body);
  }

  document.querySelectorAll('.subnav-item').forEach(function (item) {
    item.addEventListener('click', function () {
      setTimeout(sendHeight, 400);
    });
  });

  // The parent page's listener script registers late (footer), so the very
  // first broadcasts can fire before it exists and get dropped. Re-broadcast
  // on a short interval for a few seconds after load so the listener is
  // guaranteed to catch one regardless of registration timing.
  var rebroadcasts = 0;
  var rebroadcastTimer = setInterval(function () {
    sendHeight();
    rebroadcasts += 1;
    if (rebroadcasts > 20) clearInterval(rebroadcastTimer);
  }, 200);

  setTimeout(sendHeight, 100);
})();
