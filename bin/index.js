#! /usr/bin/env node

const jbang = require('../jbang');
const [,, ...args] = process.argv;

jbang.exec(...args);
