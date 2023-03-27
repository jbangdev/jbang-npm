#! /usr/bin/env node
var jbang = require('./jbang');
jbang.exec('properties@jbangdev');

try {
    jbang.exec('badinput');
    console.error('jbang error not caught!');
    process.exit(1);
} catch (err) {
    console.log('jbang error caught successfully');
}
