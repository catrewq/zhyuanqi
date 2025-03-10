export default function debounce(fn, delay = 500) {
  let t;
  return function (e) {
    clearTimeout(t);
    e.persist && e.persist();
    t = setTimeout(() => {
      fn(e);
    }, delay);
  };
}
