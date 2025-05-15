import crypto from 'crypto';

/**
 * Utility class for encrypting and decrypting sensitive data
 */
export class EncryptionUtil {
  // Use an environment variable for the encryption key
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || 'default-secure-key-please-change-in-production';
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly IV_LENGTH = 16; // For AES, this is always 16

  /**
   * Encrypt sensitive data
   * @param data Object or string to encrypt
   * @returns Encrypted data as a string
   */
  static encrypt(data: any): string {
    try {
      // Convert object to string if necessary
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Create an initialization vector
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      // Create cipher using the key and iv
      const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Prepend the iv to the encrypted data (we'll need it for decryption)
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt encrypted data
   * @param encryptedData Encrypted data string
   * @returns Decrypted data (object or string)
   */
  static decrypt(encryptedData: string): any {
    try {
      // Split the iv and encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      // Create decipher using the key and iv
      const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Try to parse as JSON, return as string if not valid JSON
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}
