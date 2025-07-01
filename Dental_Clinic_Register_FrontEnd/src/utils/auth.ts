import Cookies from 'js-cookie';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function isAuthenticated(): boolean {
  const token = Cookies.get('auth_token');
  if (!token) return false;

  if (isTokenExpired(token)) {
    Cookies.remove('auth_token');
    return false;
  }

  return true;
}
