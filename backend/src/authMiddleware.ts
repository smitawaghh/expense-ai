import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? (JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as admin.ServiceAccount)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : (require('../firebaseServiceAccount.json') as admin.ServiceAccount);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}
