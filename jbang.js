const shell = require('shelljs');
const { spawn, spawnSync } = require('child_process');
const debug = require('debug')('jbang');

const jbang = {};

/** Find the path to the jbang executable, returns null if not found */
function findJbangPath() {
	const path = shell.which('jbang') || 
	            (process.platform === 'win32' && shell.which('./jbang.cmd')) || 
	            shell.which('./jbang') ||
	            null;
	if (path) {
		debug('found existing jbang installation at %s', path);
		return path.toString(); // ensure it is a string not String
	} else {
		debug('no jbang installation found');
		return null;
	}
}

/** Implementing spawnn to ensure terminal interaction works */
function spawnJbang(jbangPath, args) {
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
	argLine = args.join(" ");
	let cmdResult = null;
	if (shell.which('jbang')
		|| (process.platform === 'win32' && shell.which('./jbang.cmd')) // windows
		|| shell.which('./jbang')) {
		//console.log('using jbang:', argLine);
		cmdResult = shell.exec('jbang ' + argLine);
	} else if (shell.which('curl') && shell.which('bash')) {
		//console.log('using curl + bash:', argLine);
		cmdResult = shell.exec('curl -Ls https://sh.jbang.dev | bash -s - ' + argLine);
	} else if (shell.which('powershell')) {
		//console.log('using powershell:', argLine);
		shell.exec('echo iex "& { $(iwr -useb https://ps.jbang.dev) } $args" > %TEMP%/jbang.ps1');
		cmdResult = shell.exec('powershell -Command "%TEMP%/jbang.ps1 ' + argLine + '"');
	} else {
		shell.echo('unable to pre-install jbang:', argLine);
		shell.exit(1);
	}

	if (cmdResult?.code !== 0) {
		const err = new Error(`The command failed: 'jbang ${argLine}'. Code: ${cmdResult?.code}`);
		err.code = cmdResult?.code;
		err.cause = cmdResult.stderr;

		throw err;
	}

	return cmdResult;
};

// Sync version with proper terminal interaction
jbang.spawnSync = function (...args) {
	const argLine = args.join(" ");
	debug('executing sync command: %s', argLine);
	
	const jbangPath = findJbangPath();

	if (jbangPath) {
		const result = spawnSync(jbangPath, args, {
			stdio: 'inherit',
			shell: true
		});

		if (result.status !== 0) {
			debug('command failed with code: %d', result.status);
			throw new Error(`The command failed with code ${result.status}`);
		}
		debug('command completed successfully');
		return result;
	} else if (shell.which('curl') && shell.which('bash')) {
		debug('installing jbang using curl and bash');
		const result = spawnSync('curl', ['-Ls', 'https://sh.jbang.dev', '|', 'bash', '-s', '-', ...args], {
			stdio: 'inherit',
			shell: true
		});

		if (result.status !== 0) {
			debug('installation failed with code: %d', result.status);
			throw new Error(`Installation failed with code ${result.status}`);
		}
		debug('installation completed successfully');
		return result;
	} else if (shell.which('powershell')) {
		debug('installing jbang using PowerShell');
		const result = spawnSync('powershell', ['-Command', `iex "& { $(iwr -useb https://ps.jbang.dev) } $args"`, ...args], {
			stdio: 'inherit',
			shell: true
		});

		if (result.status !== 0) {
			debug('PowerShell execution failed with code: %d', result.status);
			throw new Error(`Powershell execution failed with code ${result.status}`);
		}
		debug('PowerShell installation completed successfully');
		return result;
	} else {
		const err = new Error('unable to pre-install jbang: ' + argLine);
		debug('error: %o', err);
		throw err;
	}
};

//todo: provide more typesafe/argsafe variations with run...
module.exports = jbang;
