const shell = require('shelljs');
const { spawn, spawnSync } = require('child_process');
const debug = require('debug')('jbang');
const { quote } = require('shell-quote');

const jbang = {};

/** Find the path to the jbang executable, alternatively using no-install option.
 * returns a function that can be called with arguments to be appended to the jbang command
 * returns null if not found */
function findJbangPath() {
	const path = shell.which('jbang') || 
	            (process.platform === 'win32' && shell.which('./jbang.cmd')) || 
				shell.which('~/.jbang/bin/jbang') ||
	            null;
	if (path) {
		debug('found existing jbang installation at %s', path.toString());
		return (args = []) => [path.toString(), ...args] // ensure it is a string not String and append list of arguments
	} else if(shell.which('curl') && shell.which('bash')) {
		debug('running jbang using curl and bash');
		return (args = []) => ["curl", "-Ls", "https://sh.jbang.dev", "|", "bash", "-s", "-", ...args];
	} else if(shell.which('powershell')) {
		debug('running jbang using PowerShell');
		return (args = []) => ["powershell", "-Command", "iex \"& { $(iwr -useb https://ps.jbang.dev) } $args\""];
	} else {
		debug('no jbang installation found');
		return null;
	}
}

function getCommandLine(args) {
	const jbangPath = findJbangPath();
	if (jbangPath) {
		return quote(jbangPath(args));
	}
	return null;
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
