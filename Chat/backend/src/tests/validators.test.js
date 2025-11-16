const { validateEmail, validatePassword } = require('../utils/validators'); // según tus exports

describe('Validators', () => {
  test('validateEmail debe aceptar emails válidos', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  test('validateEmail debe rechazar emails inválidos', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  test('validatePassword debe aceptar contraseña válida', () => {
    expect(validatePassword('StrongPass123')).toBe(true);
  });

  test('validatePassword debe rechazar contraseña débil', () => {
    expect(validatePassword('123')).toBe(false);
  });
});
