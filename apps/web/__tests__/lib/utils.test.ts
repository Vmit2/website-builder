import {
  validateUsername,
  validateEmail,
  formatINR,
  getTimeRemaining,
  getInitials,
} from '@/lib/utils';

describe('Utils', () => {
  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('alice')).toBe(true);
      expect(validateUsername('bob123')).toBe(true);
      expect(validateUsername('test')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(validateUsername('ab')).toBe(false); // too short
      expect(validateUsername('ALICE')).toBe(false); // uppercase
      expect(validateUsername('alice-bob')).toBe(false); // hyphen
      expect(validateUsername('alice_bob')).toBe(false); // underscore
      expect(validateUsername('a'.repeat(31))).toBe(false); // too long
    });
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('alice@example.com')).toBe(true);
      expect(validateEmail('bob.smith@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('alice')).toBe(false);
      expect(validateEmail('alice@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('alice @example.com')).toBe(false);
    });
  });

  describe('formatINR', () => {
    it('should format currency correctly', () => {
      expect(formatINR(69900)).toContain('699');
      expect(formatINR(199900)).toContain('1,999');
      expect(formatINR(100)).toContain('1');
    });
  });

  describe('getTimeRemaining', () => {
    it('should calculate time remaining correctly', () => {
      const futureTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const remaining = getTimeRemaining(futureTime);

      expect(remaining.hours).toBe(2);
      expect(remaining.total).toBeGreaterThan(0);
    });

    it('should return zero if time has expired', () => {
      const pastTime = new Date(Date.now() - 1000).toISOString();
      const remaining = getTimeRemaining(pastTime);

      expect(remaining.total).toBe(0);
      expect(remaining.hours).toBe(0);
    });
  });

  describe('getInitials', () => {
    it('should extract initials correctly', () => {
      expect(getInitials('Alice Smith')).toBe('AS');
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Bob')).toBe('B');
    });

    it('should handle edge cases', () => {
      expect(getInitials('A')).toBe('A');
      expect(getInitials('  ')).toBe('');
    });
  });
});
