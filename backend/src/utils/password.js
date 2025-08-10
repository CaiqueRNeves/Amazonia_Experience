import { createHash } from 'crypto';

export default {
  async hash(password, rounds = 10) {
    // Simple hash using sha256; rounds parameter ignored
    return createHash('sha256').update(password).digest('hex');
  },

  async compare(password, hashed) {
    const hashedInput = createHash('sha256').update(password).digest('hex');
    return hashedInput === hashed;
  }
};
