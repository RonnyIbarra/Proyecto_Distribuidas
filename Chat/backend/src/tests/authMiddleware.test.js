const authMiddleware = require('../middleware/authMiddleware');

describe('authMiddleware', () => {
  test('debe llamar next() si hay token válido', () => {
    const req = { headers: { authorization: 'Bearer valid.token.here' } };
    const res = {};
    const next = jest.fn();

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('debe retornar error si no hay token', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: true }));
  });
});
