/**
 * Authentication Middleware
 * 
 * Verifiziert JWT-Token und fügt User-Daten zum Request hinzu
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    schemaName: string;
  };
}

/**
 * Middleware zum Verifizieren des JWT-Tokens
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Token aus Authorization Header extrahieren
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // "Bearer " entfernen
    
    // Token verifizieren
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      username: string;
      schemaName: string;
    };

    // User-Daten zum Request hinzufügen
    req.user = {
      id: decoded.id,
      username: decoded.username,
      schemaName: decoded.schemaName
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Optionale Authentication - setzt User wenn Token vorhanden
 */
export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      username: string;
      schemaName: string;
    };

    req.user = {
      id: decoded.id,
      username: decoded.username,
      schemaName: decoded.schemaName
    };

    next();
  } catch (_error) {
    // Bei optionaler Auth einfach weitermachen
    next();
  }
};
