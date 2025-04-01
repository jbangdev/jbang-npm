const shell = require('shelljs');
const { spawn, spawnSync } = require('child_process');
const debug = require('debug')('jbang');

const jbang = {};

jbang.quote = function quote(xs) {
    return xs.map(function (s) {
        if (s === '') {
            return '\'\'';
        }
      

        if ((/["\s]/).test(s) && !(/'/).test(s)) {
            return "'" + s.replace(/(['\\])/g, '\\$1') + "'";
        }

        if ((/["'\s]/).test(s)) {
            return '"' + s.replace(/(["\\$`!])/g, '\\$1') + '"';
        }
        return String(s).replace(/([A-Za-z]:)?([#!"$&'()*,:;<=>?[\\\]^`{|}])/g, '$1\\$2');
    }).join(' ');
}

/** Find the path to the jbang executable, alternatively using no-install option.
 * returns a function that can be called with arguments to be appended to the jbang command
 * returns null if not found */
function getCommandLine(args) {
	debug('Searching for jbang executable...');
	
	debug('args type: %s', typeof args);
	// If args is a string, parse it into a list
	if (typeof args === 'string' ) {
		debug("args is a string, use as is");
		argLine = args;
	} else { // else it is already a list and we need to quote each argument before joining them
		debug("args is a list, quoting each argument");
		argLine = jbang.quote(args);
	}

	
	const path =
			(process.platform === 'win32' && shell.which('jbang.cmd')) || 
			shell.which('jbang') ||
			(process.platform === 'win32' && shell.which('~\.jbang\bin\jbang.cmd')) || 
			shell.which('~/.jbang/bin/jbang') ||
			null;
	if (path) {
		debug('found existing jbang installation at %s', path.toString());
		return [path.toString(),argLine].join(' ');// ensure it is a string not String and append list of arguments
	} else if(shell.which('curl') && shell.which('bash')) {
		debug('running jbang using curl and bash');
		return ["curl -Ls https://sh.jbang.dev | bash -s -", argLine].join(' ');
	} else if(shell.which('powershell')) {
		debug('running jbang using PowerShell');
		return `powershell -Command iex "& { $(iwr -useb https://ps.jbang.dev) } ${argLine}"`;
	} else {
		debug('no jbang installation found');
		return null;
	}
}

jbang.exec = function (args) {
	debug('try to execute async command: %o', args);

	let cmdResult = null;

	const cmdLine = getCommandLine(args);

	if (cmdLine) {
		debug('executing command: %s', cmdLine);
		cmdResult = shell.exec(cmdLine);
	} else {
		shell.echo('Could not locate a way to run jbang. Try install jbang manually and try again.');
		throw new Error('Could not locate a way to run jbang. Try install jbang manually and try again.', 2);
	}

	return {
		stdout: cmdResult.stdout,
		stderr: cmdResult.stderr,
		exitCode: cmdResult.code
	};
};

// Sync version with proper terminal interaction
jbang.spawnSync = function (args) {
	debug('try to execute sync command: %o', args);
	
	const cmdLine = getCommandLine(args);

	if (cmdLine) {
		debug('spawning sync command: %s', cmdLine);
		const result = spawnSync(cmdLine, {
			stdio: 'inherit',
			shell: true
		});
		debug('command completed successfully: %o', result);
		return result;
	}  else {
		shell.echo('Could not locate a way to run jbang. Try install jbang manually and try again.');
		throw new Error('Could not locate a way to run jbang. Try install jbang manually and try again.', 2);
	}
};

//todo: provide more typesafe/argsafe variations with run...
module.exports = jbang;
