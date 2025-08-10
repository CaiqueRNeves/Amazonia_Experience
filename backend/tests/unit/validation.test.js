import { isValidEmail, isValidCoordinates, isAlphanumericWithSpaces, sanitizeSQLInput, sanitizeHtmlInput, isValidISODate, hasRequiredProperties } from '../../src/utils/validation.js';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    test('deve retornar true para emails válidos', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('name.surname@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    test('deve retornar false para emails inválidos', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidCoordinates', () => {
    test('deve retornar true para coordenadas válidas', () => {
      expect(isValidCoordinates(0, 0)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
      expect(isValidCoordinates('-1.4500', '-48.4800')).toBe(true);
    });

    test('deve retornar false para coordenadas inválidas', () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
      expect(isValidCoordinates(-91, 0)).toBe(false);
      expect(isValidCoordinates(0, -181)).toBe(false);
      expect(isValidCoordinates('invalid', 0)).toBe(false);
      expect(isValidCoordinates(0, 'invalid')).toBe(false);
    });
  });

  describe('isAlphanumericWithSpaces', () => {
    test('deve retornar true para strings alfanuméricas com espaços', () => {
      expect(isAlphanumericWithSpaces('Hello World')).toBe(true);
      expect(isAlphanumericWithSpaces('Test123')).toBe(true);
      expect(isAlphanumericWithSpaces('123 456')).toBe(true);
    });

    test('deve retornar false para strings com caracteres especiais', () => {
      expect(isAlphanumericWithSpaces('Hello, World!')).toBe(false);
      expect(isAlphanumericWithSpaces('Test@123')).toBe(false);
      expect(isAlphanumericWithSpaces('User-Name')).toBe(false);
    });
  });

  describe('sanitizeSQLInput', () => {
    test('deve escapar aspas simples para prevenir SQL injection', () => {
      expect(sanitizeSQLInput("O'Reilly")).toBe("O''Reilly");
      expect(sanitizeSQLInput("Let's go")).toBe("Let''s go");
    });

    test('deve escapar barras invertidas', () => {
      expect(sanitizeSQLInput('C:\\path\\to\\file')).toBe('C:\\\\path\\\\to\\\\file');
    });

    test('deve retornar o valor original se for null ou undefined', () => {
      expect(sanitizeSQLInput(null)).toBeNull();
      expect(sanitizeSQLInput(undefined)).toBeUndefined();
    });
  });

  describe('sanitizeHtmlInput', () => {
    test('deve escapar tags HTML para prevenir XSS', () => {
      expect(sanitizeHtmlInput('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(sanitizeHtmlInput('<img src="x" onerror="alert(1)">')).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
    });

    test('deve escapar aspas simples e duplas', () => {
      expect(sanitizeHtmlInput('Text with "quotes" and \'single quotes\'')).toBe('Text with &quot;quotes&quot; and &#39;single quotes&#39;');
    });

    test('deve retornar o valor original se for null ou undefined', () => {
      expect(sanitizeHtmlInput(null)).toBeNull();
      expect(sanitizeHtmlInput(undefined)).toBeUndefined();
    });
  });

  describe('isValidISODate', () => {
    test('deve retornar true para datas ISO válidas', () => {
      expect(isValidISODate('2023-07-10')).toBe(true);
      expect(isValidISODate('2023-07-10T14:48:00.000Z')).toBe(true);
    });

    test('deve retornar false para datas em formato inválido', () => {
      expect(isValidISODate('10/07/2023')).toBe(false);
      expect(isValidISODate('texto aleatório')).toBe(false);
      expect(isValidISODate('')).toBe(false);
    });
  });

  describe('hasRequiredProperties', () => {
    test('deve retornar true se o objeto tiver todas as propriedades requeridas', () => {
      const obj = { name: 'Test', email: 'test@example.com', age: 25 };
      expect(hasRequiredProperties(obj, ['name', 'email'])).toBe(true);
    });

    test('deve retornar false se alguma propriedade requerida estiver faltando', () => {
      const obj = { name: 'Test', age: 25 };
      expect(hasRequiredProperties(obj, ['name', 'email'])).toBe(false);
    });

    test('deve retornar false se alguma propriedade requerida for null ou undefined', () => {
      const obj = { name: 'Test', email: null, age: 25 };
      expect(hasRequiredProperties(obj, ['name', 'email'])).toBe(false);
    });
  });
});