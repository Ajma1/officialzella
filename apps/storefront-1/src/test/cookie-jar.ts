// Minimal `next/headers` cookies() mock for tests that exercise cookie-based
// customer sessions outside a real request scope. Covers only the subset of
// the cookie store API session.ts uses (get/set/delete).
const store = new Map<string, string>();

export function cookies() {
  return Promise.resolve({
    get: (name: string) =>
      store.has(name) ? { name, value: store.get(name)! } : undefined,
    set: (name: string, value: string) => {
      store.set(name, value);
    },
    delete: (name: string) => {
      store.delete(name);
    },
  });
}

export function __resetCookieJar() {
  store.clear();
}

export function __setCookie(name: string, value: string) {
  store.set(name, value);
}
