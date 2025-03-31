#! /usr/bin/env node

const jbang = require('../jbang');
const [,, ...args] = process.argv;

// using spawnSync to ensure the command is executed in the same process/stdin/signals
// is wired up so it can be cancelled/killed etc.
jbang.spawnSync(...args);
