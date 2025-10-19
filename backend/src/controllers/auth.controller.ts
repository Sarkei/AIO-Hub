/**
 * Authentication Controller
 * 
 * Handles user registration, login, and profile management
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { createUserSchema } from '../services/schema.service';

export class AuthController {
  /**
   * Registriert neuen User und legt eigenes Schema an
   */
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log('📝 Registration attempt:', { username: req.body.username, email: req.body.email });
      
      // Validierung prüfen
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ Validation errors:', errors.array());
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const { username, email, password } = req.body;

      // Prüfen ob User bereits existiert
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        console.error('❌ User already exists:', { username, email });
        res.status(409).json({
          error: 'Conflict',
          message: 'Username or email already exists'
        });
        return;
      }

      // Passwort hashen
      const passwordHash = await bcrypt.hash(password, 12);

      // Schema-Namen generieren (user_[uuid-prefix])
      const schemaName = `user_${username.toLowerCase()}_${Date.now()}`;

      // User in DB anlegen
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
          schemaName
        }
      });

      // Eigenes Schema für User erstellen
      console.log('🔧 Creating user schema:', schemaName);
      await createUserSchema(schemaName);
      console.log('✅ Schema created successfully');

      // JWT Token generieren
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          schemaName: user.schemaName
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      console.log('✅ User registered successfully:', user.username);
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to register user'
      });
    }
  }

  /**
   * User Login
   */
  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Validierung prüfen
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
        return;
      }

      const { username, password } = req.body;

      // User suchen
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid username or password'
        });
        return;
      }

      // Passwort verifizieren
      const isValid = await bcrypt.compare(password, user.passwordHash);

      if (!isValid) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid username or password'
        });
        return;
      }

      // JWT Token generieren
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          schemaName: user.schemaName
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to login'
      });
    }
  }

  /**
   * Aktuellen User abrufen (geschützte Route)
   */
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get user'
      });
    }
  }
}
