#! /usr/bin/env node
const jbang = require('@jbangdev/jbang');
jbang.exec('--java 8+', 'properties@jbangdev', 'java.version');
val = jbang.exec('hello.java', '"Java Script"');
console.log(val);

