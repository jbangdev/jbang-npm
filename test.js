#! /usr/bin/env node
const assert = require('assert');
const jbang = require('./jbang');

    async function runTests() {

        assert.equal(jbang.quote(['--version']), '--version');
        assert.equal(jbang.quote(['properties@jbangdev']), 'properties@jbangdev');
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
            out = jbang.exec('properties@jbangdev');
            assert.equal(out.exitCode, 0);
            console.log('✓ Sync catalog script works');
        } catch (err) {
            console.error('✗ Sync catalog script failed:', err);
            process.exit(1);
        }

        // Test error handling - both sync and async
        console.log('\nTesting error handling...');

        out = jbang.exec('nonexistent-script-name');
        assert.equal(out.exitCode, 2);

        console.log('\n✓ All tests passed!');
    }

    // Run the tests
    runTests().catch(err => {
        console.error('Test suite failed:', err);
        process.exit(1);
    });
