import { Router } from 'express';
import { login } from '../services/auth.service.js';
import { parseLoginBody } from '../validators/login.validator.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { username, password } = parseLoginBody(req.body);
  res.json(login(username, password));
});
