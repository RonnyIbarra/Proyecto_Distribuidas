import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error();
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const hashPin = (pin) => bcrypt.hash(pin, 10);
export const comparePin = (pin, hash) => bcrypt.compare(pin, hash);