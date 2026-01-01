import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  private readonly serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  private readonly projectId = process.env.FIREBASE_PROJECT_ID;
  private readonly privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n',
  );
  private readonly clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  private readonly PROVIDER_MAP: Record<string, string> = {
    'google.com': 'GOOGLE',
    'facebook.com': 'FACEBOOK',
    'github.com': 'GITHUB',
  };

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      // Check if already initialized
      if (admin.apps.length > 0) {
        this.firebaseApp = admin.apps[0]!;
        this.logger.log('Firebase Admin SDK already initialized');
        return;
      }

      // Initialize with service account (recommended for production)
      if (this.serviceAccountPath) {
        // Resolve absolute path from project root
        const absolutePath = path.resolve(
          process.cwd(),
          this.serviceAccountPath,
        );
        const serviceAccount = require(absolutePath);
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('Firebase initialized with service account file');
      } else {
        // Initialize from environment variables
        if (!this.projectId || !this.privateKey || !this.clientEmail) {
          throw new Error(
            'Missing Firebase credentials in environment variables',
          );
        }

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: this.projectId,
            privateKey: this.privateKey,
            clientEmail: this.clientEmail,
          }),
        });
        this.logger.log('Firebase initialized with environment variables');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
      throw error;
    }
  }

  /**
   * Verify Firebase ID token
   * @param idToken - Firebase ID token from client
   * @returns Decoded token with user info
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      this.logger.error('Failed to verify Firebase token:', error);
      throw new Error('Invalid Firebase token');
    }
  }

  /**
   * Get user info from Firebase
   * @param uid - Firebase user UID
   */
  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await admin.auth().getUser(uid);
    } catch (error) {
      this.logger.error(`Failed to get user ${uid}:`, error);
      throw new Error('Failed to fetch user from Firebase');
    }
  }

  /**
   * Extract provider from Firebase token
   * Returns 'GOOGLE', 'FACEBOOK', 'GITHUB', etc.
   */
  getProviderFromToken(token: admin.auth.DecodedIdToken): string {
    const provider = token.firebase?.sign_in_provider;

    if (!provider) {
      throw new Error('No provider found in token');
    }

    return this.PROVIDER_MAP[provider] || provider;
  }
}
