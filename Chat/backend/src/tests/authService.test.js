const authService = require('../services/authService');

describe('AuthService', () => {
  beforeAll(async () => {
    await authService.initializeAdmin('testadmin', 'testpass123');
  });

  test('debe inicializar administrador', () => {
    const admin = authService.getAdmin();
    expect(admin).toBeDefined();
    expect(admin.username).toBe('testadmin');
  });

  test('debe fallar con credenciales incorrectas', async () => {
    try {
      await authService.login('testadmin', 'wrongpassword');
      fail('Debería lanzar error');
    } catch (error) {
      expect(error.message).toBe('Credenciales inválidas');
    }
  });

  test('debe fallar con usuario incorrecto', async () => {
    try {
      await authService.login('wronguser', 'testpass123');
      fail('Debería lanzar error');
    } catch (error) {
      expect(error.message).toBe('Credenciales inválidas');
    }
  });

  test('debe generar token válido', async () => {
    const result = await authService.login('testadmin', 'testpass123');
    expect(result.token).toBeDefined();
    expect(result.username).toBe('testadmin');
  });

  test('debe verificar token válido', async () => {
    const result = await authService.login('testadmin', 'testpass123');
    const decoded = authService.verifyToken(result.token);
    expect(decoded.username).toBe('testadmin');
  });

  test('debe fallar con token inválido', () => {
    try {
      authService.verifyToken('invalid.token.here');
      fail('Debería lanzar error');
    } catch (error) {
      expect(error.message).toContain('Token inválido');
    }
  });
});
