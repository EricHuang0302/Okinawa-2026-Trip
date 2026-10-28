(() => {
  'use strict';
  const active = document.querySelector('.day-nav [aria-current]');
  if (active) active.setAttribute('title', '目前頁面');
  const print = document.querySelector('[data-print]');
  if (print) { print.hidden = false; print.addEventListener('click', () => window.print()); }
  const boxes = [...document.querySelectorAll('[data-pack]')];
  if (boxes.length) {
    const key = 'okinawa-2026-packing-v1';
    const status = document.querySelector('[data-save-status]');
    const progress = document.querySelector('progress');
    const counter = document.querySelector('[data-counter]');
    let storageAvailable = true;
    let saved = {};
    try { const parsed = JSON.parse(localStorage.getItem(key) || '{}'); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed; }
    catch { storageAvailable = false; }
    boxes.forEach(box => { box.checked = saved[box.dataset.pack] === true; });
    const update = (persist = false) => {
      const total = boxes.filter(box => box.checked).length;
      progress.max = boxes.length; progress.value = total;
      counter.textContent = `${total} / ${boxes.length} 項完成`;
      if (persist) {
        try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(boxes.map(box => [box.dataset.pack, box.checked])))); storageAvailable = true; }
        catch { storageAvailable = false; }
      }
      status.textContent = storageAvailable ? '已記住這個瀏覽器的勾選狀態。' : '目前無法儲存；關閉或重新整理後，勾選狀態可能消失。';
    };
    boxes.forEach(box => box.addEventListener('change', () => update(true)));
    const reset = document.querySelector('[data-reset]');
    reset.hidden = false;
    reset.addEventListener('click', () => {
      if (window.confirm('要清除這份行前清單的所有勾選嗎？')) { boxes.forEach(box => { box.checked = false; }); update(true); }
    });
    window.addEventListener('storage', event => {
      if (event.key !== key) return;
      try { const changed = JSON.parse(event.newValue || '{}'); boxes.forEach(box => { box.checked = changed?.[box.dataset.pack] === true; }); update(); } catch { /* Keep the current checklist if another tab saved invalid data. */ }
    });
    update();
  }
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();
