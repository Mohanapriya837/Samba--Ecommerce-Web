export const homeFor = (user) => (user?.role === 'ADMIN' ? '/admin' : '/dashboard');

/** Where to send a user after logging in / registering. */
export function postLoginTarget(user, from) {
  const path = from?.pathname;
  if (path && path !== '/login' && path !== '/register') {
    const isAdminPath = path.startsWith('/admin');
    if (user.role === 'ADMIN' && isAdminPath) return from;
    if (user.role !== 'ADMIN' && !isAdminPath) return from;
  }
  return homeFor(user);
}
