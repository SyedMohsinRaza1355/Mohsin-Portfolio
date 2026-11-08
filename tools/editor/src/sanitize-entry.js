import DOMPurify from 'dompurify';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'IFRAME') {
    const src = node.getAttribute('src') || '';
    if (!/^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{6,20}(\?[\w=&%-]*)?$/.test(src)) node.remove();
  }
  if (node.tagName === 'IMG') {
    const src = node.getAttribute('src') || '';
    if (!/^https:\/\//i.test(src)) node.remove();
  }
  if (node.tagName === 'A') {
    const href = node.getAttribute('href') || '';
    if (/^\s*javascript:/i.test(href)) node.removeAttribute('href');
    if (node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer');
  }
});

window.sanitizeHtml = (html) =>
  DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allowfullscreen', 'frameborder', 'allow', 'target', 'data-youtube-video', 'data-type', 'data-checked', 'colspan', 'rowspan', 'loading'],
    FORBID_TAGS: ['script', 'style', 'form', 'input', 'object', 'embed'],
  });
