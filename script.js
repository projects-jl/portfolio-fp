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

  setTimeout(sendHeight, 100);
})();
