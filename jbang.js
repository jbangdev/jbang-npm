const shell = require('shelljs');
const { spawn, spawnSync } = require('child_process');
const debug = require('debug')('jbang');

const jbang = {};

jbang.quote = function quote(xs) {
    return xs.map(function (s) {
        if (s === '') {
            return '\'\'';
        }
        if (s && typeof s === 'object') {
            return s.op.replace(/(.)/g, '\\$1');
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
	const argLine = jbang.quote(args);
	const path = shell.which('jbang') || 
	            (process.platform === 'win32' && shell.which('jbang.cmd')) || 
				shell.which('~/.jbang/bin/jbang') ||
	            null;
	if (path) {
		debug('found existing jbang installation at %s', path.toString());
		return [path.toString(),argLine].join(' ');// ensure it is a string not String and append list of arguments
	} else if(shell.which('curl') && shell.which('bash')) {
		debug('running jbang using curl and bash');
		return ["curl", "-Ls", "https://sh.jbang.dev", "|", "bash", "-s", "-", argLine].join(' ');
	} else if(shell.which('powershell')) {
		debug('running jbang using PowerShell');
		return ["powershell", "-Command", "iex \"& { $(iwr -useb https://ps.jbang.dev) } $argLine\""].join(' ');
	} else {
		debug('no jbang installation found');
		return null;
	}
}


/** Implementing spawnn to ensure terminal interaction works */
function spawnJbang(jbangPath) {
	return new Promise((resolve, reject) => {
		
		debug('spawning process with path: %s', jbangPath);
		debug('arguments: %o', args);

		const jbangProcess = spawn(jbangPath, args, {
			stdio: 'inherit',  // This ensures terminal interaction works
			shell: true       // This ensures the command works on Windows too
		});

		jbangProcess.on('close', (code) => {
			if (code === 0) {
				debug('process completed successfully');
				resolve();
			} else {
				debug('process failed with code: %d', code);
				reject(new Error(`The command failed with code ${code}`));
			}
		});

		jbangProcess.on('error', (err) => {
			debug('process error: %o', err);
			reject(err);
		});
	});
}

jbang.exec = function (...args) {
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
jbang.spawnSync = function (...args) {
	debug('try to execute sync command: %o', args);
	
	const cmdLine = getCommandLine(args);

	if (cmdLine) {
		debug('executing sync command: %s', cmdLine);
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
