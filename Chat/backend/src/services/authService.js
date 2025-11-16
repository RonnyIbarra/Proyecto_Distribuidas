const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

class AuthService {
  constructor() {
    this.admin = null;
  }

  async initializeAdmin(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    this.admin = new Admin(username, hashedPassword);
  }

  async login(username, password) {
    if (!this.admin) {
      throw new Error('Sistema no inicializado');
    }

    if (username !== this.admin.username) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, this.admin.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      { username: this.admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { token, username };
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  getAdmin() {
    return this.admin;
  }
}

module.exports = new AuthService();
