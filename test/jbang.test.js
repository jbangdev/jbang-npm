const jbang = require('../jbang');

describe('JBang Integration Tests', () => {
  test('should get Java version', () => {
    const result = jbang.exec('--java 21+', 'properties@jbangdev', 'java.version');
    expect(result).toBeDefined();
    expect(result.stdout).toMatch(/\d+\.\d+/); // Should match version format like "21.0"
  });

  test('should handle jbang command with multiple arguments', () => {
    const result = jbang.exec('--java 21+ properties@jbangdev java.version');
    expect(result).toBeDefined();
    expect(result.stdout).toBeDefined();
    expect(result.stdout).toContain('java.version');
  });

  // Add error case test
  test('should handle invalid java version gracefully', () => {
    const result = jbang.exec('--java invalid properties@jbangdev java.version');
    expect(result).toBeDefined();
    expect(result.stderr).toContain('Invalid version');
  });

  test('should handle quotes in arguments', () => {
    const result = jbang.exec('-Dxyz="funky bear" properties@jbangdev');
    expect(result).toBeDefined();
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/xyz.*funky bear/);
  });
}); 