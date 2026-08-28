import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ message: 'Pristup odbijen. Token nije dostavljen.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Pohranjujemo podatke iz tokena (id_korisnika, uloga) u req.user
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Neispravan ili istekao token.' });
  }
};