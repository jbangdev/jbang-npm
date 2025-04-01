const jbang = require('../jbang');

describe('JBang Integration Tests', () => {
  test('should get version information', () => {
    const result = jbang.exec('--version');
    expect(result.exitCode).toBe(0);
  });

  test('should execute catalog script', () => {
    const result = jbang.exec('properties@jbangdev');
    expect(result.exitCode).toBe(0);
  });

  test('should handle non-existent script', () => {
    const result = jbang.exec('nonexistent-script-name');
    expect(result.exitCode).toBe(2);
  });

  test('should handle multiple arguments as string', () => {
    const result = jbang.exec('-Dx="funky string" properties@jbangdev');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('funky string');
  });

  test('should handle multiple arguments as array', () => {
    const result = jbang.exec(['-Dx=funky list', 'properties@jbangdev']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('funky list');
  });

  test('should handle Java version specification', () => {
    const result = jbang.exec(['--java', '8+', 'properties@jbangdev', 'java.version']);
    expect(result).toBeDefined();
    expect(result.stdout).toMatch(/\d+\.\d+/);
  });

  test('should handle invalid java version gracefully', () => {
    const result = jbang.exec('--java invalid properties@jbangdev java.version');
    expect(result).toBeDefined();
    expect(result.stderr).toContain('Invalid version');
  });

});

(process.platform === 'win32' ? describe.skip : describe)('Quote Tests', () => {
  test('should quote empty string', () => {
    expect(jbang.quote([''])).toBe("");
  });

  test('should quote simple string without special chars', () => {
    expect(jbang.quote(['hello'])).toBe('hello');
  });

  test('should quote string containing spaces', () => {
    expect(jbang.quote(['hello world'])).toBe("'hello world'");
  });

  test('should quote string containing double quotes', () => {
    expect(jbang.quote(['hello "world"'])).toBe("'hello \"world\"'");
  });

  test('should quote string containing single quotes', () => {
    expect(jbang.quote(["hello'world"])).toBe("'hello'\\''world'");
  });

  test('should quote string containing special characters', () => {
    expect(jbang.quote(['hello$world'])).toBe("'hello$world'");
    expect(jbang.quote(['hello!world'])).toBe("'hello!world'");
    expect(jbang.quote(['hello#world'])).toBe("'hello#world'");
  });

  test('should quote multiple strings', () => {
    expect(jbang.quote(['hello world'])).toBe("'hello world'");
    expect(jbang.quote(["hello 'big world'"])).toBe("'hello '\\''big world'\\'''");
  });
}); 