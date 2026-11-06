const fs = require('fs');
const os = require('os');
const path = require('path');
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
    expect(result.stderr).toContain('Invalid value for');
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

describe('Windows home path', () => {
  test('joins home, .jbang, bin, and jbang.cmd without backslash escapes', () => {
    const home = 'C:\\Users\\tester';
    const candidate = jbang.windowsHomeJbangCmd(home, path.win32);

    expect(candidate).toBe(path.win32.join(home, '.jbang', 'bin', 'jbang.cmd'));
    expect(candidate).toBe('C:\\Users\\tester\\.jbang\\bin\\jbang.cmd');
    expect(candidate.includes('\b')).toBe(false);

    // The old literal is mangled: \. and \j drop the backslash, and \b is a backspace.
    const mangledLiteral = '~\.jbang\bin\jbang.cmd';
    expect(mangledLiteral).toBe('~.jbang\u0008injbang.cmd');
    expect(mangledLiteral).not.toBe(path.win32.join('~', '.jbang', 'bin', 'jbang.cmd'));
  });

  test('returns the home jbang.cmd when that file exists and null when it does not', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'jbang-home-'));
    try {
      expect(jbang.resolveWindowsHomeJbang(home, path)).toBeNull();

      const cmd = path.join(home, '.jbang', 'bin', 'jbang.cmd');
      fs.mkdirSync(path.dirname(cmd), { recursive: true });
      fs.writeFileSync(cmd, '');
      expect(jbang.resolveWindowsHomeJbang(home, path)).toBe(cmd);

      fs.rmSync(cmd);
      fs.mkdirSync(cmd);
      expect(jbang.resolveWindowsHomeJbang(home, path)).toBeNull();
    } finally {
      fs.rmSync(home, { recursive: true, force: true });
    }
  });
});

