const NAV_EVENT = 'careos:navigate';

const buildTarget = (path) => {
  const url = new URL(path, window.location.origin);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const navigateTo = (path, { replace = false } = {}) => {
  const target = buildTarget(path);
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (target === current) return;

  if (replace) {
    window.history.replaceState({}, '', target);
  } else {
    window.history.pushState({}, '', target);
  }
  window.dispatchEvent(new Event(NAV_EVENT));
};

export const subscribeNavigation = (callback) => {
  const handler = () => callback(window.location.pathname);
  window.addEventListener('popstate', handler);
  window.addEventListener(NAV_EVENT, handler);
  return () => {
    window.removeEventListener('popstate', handler);
    window.removeEventListener(NAV_EVENT, handler);
  };
};
