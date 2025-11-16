// Utilidades para validación
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePin(pin) {
  if (!pin || typeof pin !== 'string') return false;
  return /^\d{4,6}$/.test(pin);
}

function validateNickname(nickname) {
  if (!nickname || typeof nickname !== 'string') return false;
  const trimmed = nickname.trim();
  return trimmed.length >= 3 && trimmed.length <= 20;
}

function sanitizeInput(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  validateEmail,
  validatePin,
  validateNickname,
  sanitizeInput
};
