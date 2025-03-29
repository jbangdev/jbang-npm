#! /usr/bin/env node
const assert = require('assert');
const jbang = require('./jbang');

// Test version command
console.log('Testing version command...');
try {
    jbang.exec('--version');
    console.log('✓ Version command works');
} catch (err) {
    console.error('✗ Version command failed:', err);
    process.exit(1);
}

// Test running a catalog script
console.log('\nTesting catalog script...');
try {
    jbang.exec('properties@jbangdev');
    console.log('✓ Catalog script works');
} catch (err) {
    console.error('✗ Catalog script failed:', err);
    process.exit(1);
}

// Test error handling
console.log('\nTesting error handling...');
try {
    jbang.exec('nonexistent-script-name');
    console.error('✗ Error handling test failed: should have thrown an error');
    process.exit(1);
} catch (err) {
    console.log('✓ Error handling works');
}

console.log('\n✓ All tests passed!');
