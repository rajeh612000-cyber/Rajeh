/*
  Miko Foods — product page WhatsApp deep-link.
  Keeps the "Order on WhatsApp" button's pre-filled message in sync with the
  currently selected variant (weight). Pure vanilla JS, no dependencies.
*/
(function () {
  function initWA(wrap) {
    var number = (wrap.getAttribute('data-number') || '').replace(/\D/g, '');
    var prefill = wrap.getAttribute('data-prefill') || '';
    var title = wrap.getAttribute('data-title') || '';
    var link = wrap.querySelector('.miko-pdp-wa');
    if (!link || !number) return;

    // Scope to the surrounding product form / info so we read the right picker.
    var scope = wrap.closest('product-info') || wrap.closest('.product') || document;

    function currentVariant() {
      var picker = scope.querySelector('variant-selects');
      if (!picker) return '';
      var vals = [];
      // Radio-style pickers: one checked input per option group.
      var groups = picker.querySelectorAll('fieldset');
      if (groups.length) {
        groups.forEach(function (fs) {
          var checked = fs.querySelector('input:checked');
          if (checked && checked.value) vals.push(checked.value.trim());
        });
      }
      // Dropdown-style pickers.
      if (!vals.length) {
        picker.querySelectorAll('select').forEach(function (s) {
          if (s.value) vals.push(s.value.trim());
        });
      }
      return vals.join(' / ');
    }

    function update() {
      var msg = (prefill ? prefill + ' ' : '') + title;
      var v = currentVariant();
      if (v && v.toLowerCase() !== 'default title') msg += ' — ' + v;
      link.setAttribute('href', 'https://wa.me/' + number + '?text=' + encodeURIComponent(msg));
    }

    scope.addEventListener('change', update);
    // Dawn re-renders the variant picker on change; catch that too.
    document.addEventListener('variant:change', update);
    update();
  }

  function boot() {
    document.querySelectorAll('[data-miko-wa]').forEach(initWA);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
