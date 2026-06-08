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
      var toggle = document.querySelector('.case-toggle');
      if (panel && toggle) {
        var toggleBottom = toggle.getBoundingClientRect().bottom;
        var panelTop = panel.getBoundingClientRect().top;
        window.scrollBy({ top: panelTop - toggleBottom, behavior: 'smooth' });
      } else if (panel) {
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
  // position: sticky never activates inside an auto-resizing iframe: the
  // iframe's own viewport is sized to fit its full content, so it never
  // scrolls internally — all scrolling happens on the parent page, which the
  // iframe's CSS can't see. When the embedding page's listener script (see
  // FlatpayProcessAutoResize / scroll-sync companion) reports the iframe's
  // position in the parent's viewport, emulate sticky with position: fixed,
  // translated into the iframe's own coordinate space.
  if (window.self === window.top) return;

  var toggle = document.querySelector('.case-toggle');
  var container = document.querySelector('.case-studies');
  if (!toggle || !container) return;

  var STICK_AT = 120; // keep in sync with .case-toggle { top: 120px }
  var natural = null;
  var stuck = false;
  var spacer = null;
  var lastIframeTop = null;

  function measure() {
    if (stuck) return;
    var t = toggle.getBoundingClientRect();
    var c = container.getBoundingClientRect();
    natural = { top: t.top, left: t.left, width: t.width, height: t.height, containerBottom: c.bottom };
  }

  function stick(top) {
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.setAttribute('aria-hidden', 'true');
      toggle.parentNode.insertBefore(spacer, toggle);
    }
    spacer.style.height = natural.height + 'px';
    toggle.style.position = 'fixed';
    toggle.style.top = top + 'px';
    toggle.style.left = natural.left + 'px';
    toggle.style.width = natural.width + 'px';
    toggle.style.margin = '0';
    stuck = true;
  }

  function release() {
    if (!stuck) return;
    toggle.style.position = '';
    toggle.style.top = '';
    toggle.style.left = '';
    toggle.style.width = '';
    toggle.style.margin = '';
    if (spacer) spacer.style.height = '0';
    stuck = false;
  }

  function apply(iframeTop) {
    lastIframeTop = iframeTop;
    if (!natural) measure();
    if (!natural) return;
    var naturalY = iframeTop + natural.top;
    if (naturalY >= STICK_AT) {
      release();
    } else {
      stick(Math.min(STICK_AT - iframeTop, natural.containerBottom - natural.height));
    }
  }

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.source !== 'flatpay-process-parent' || typeof d.iframeTop !== 'number') return;
    apply(d.iframeTop);
  });

  window.addEventListener('resize', function () {
    release();
    natural = null;
    measure();
    if (lastIframeTop !== null) apply(lastIframeTop);
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
