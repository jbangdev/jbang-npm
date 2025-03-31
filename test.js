#! /usr/bin/env node
const assert = require('assert');
const jbang = require('./jbang');

async function runTests() {
    // Test version command - both sync and async
    console.log('Testing version command...');
    try {
        jbang.exec('--version');
        console.log('✓ Sync version command works');
    } catch (err) {
        console.error('✗ Sync version command failed:', err);
        process.exit(1);
    }

    // Test running a catalog script - both sync and async
    console.log('\nTesting catalog script...');
    try {
        jbang.exec('properties@jbangdev');
        console.log('✓ Sync catalog script works');
    } catch (err) {
        console.error('✗ Sync catalog script failed:', err);
        process.exit(1);
    }

    // Test error handling - both sync and async
    console.log('\nTesting error handling...');
    try {
        jbang.exec('nonexistent-script-name');
        console.error('✗ Sync error handling test failed: should have thrown an error');
        process.exit(1);
    } catch (err) {
        console.log('✓ Sync error handling works');
    }

    // Test multiple arguments
console.log('\nTesting multiple arguments...');
try {
    const output = jbang.exec('-D="funky bear" properties@jbangdev');
    assert(output.includes('funky bear'), 'Output should contain "funky bear"');
    console.log('✓ Multiple arguments test works');
} catch (err) {
    console.error('✗ Multiple arguments test failed:', err);
    process.exit(1);
}


    console.log('\n✓ All tests passed!');
}

// Run the tests
runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
