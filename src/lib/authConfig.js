// Centralized auth configurations

export function getAuthorizedEmail() {
  return process.env.AUTHORIZED_EMAIL || '';
}

export function isAuthorized(email) {
  if (!email) return false;
  
  const authorized = getAuthorizedEmail().toLowerCase().trim();
  const incoming = email.toLowerCase().trim();
  
  return incoming === authorized && authorized !== '';
}
