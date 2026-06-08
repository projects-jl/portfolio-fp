(function () {
  var toggles = document.querySelectorAll('.case-toggle-btn');
  var triggers = document.querySelectorAll('[data-stream]');
  var panels = document.querySelectorAll('.panel');

  function activate(stream, scrollToPanel) {
    toggles.forEach(function (btn) {
      var active = btn.dataset.stream === stream;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.dataset.panel === stream);
    });

    if (scrollToPanel) {
      var panel = document.getElementById('panel-' + stream);
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      activate(trigger.dataset.stream, true);
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

  document.querySelectorAll('[data-stream]').forEach(function (item) {
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
