const shell = require('shelljs');
const { spawn, spawnSync } = require('child_process');
const debug = require('debug')('jbang');

const jbang = {};

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

// Async version
jbang.execAsync = async function (...args) {
	const argLine = args.join(" ");
	debug('executing async command: %s', argLine);
	
	const jbangPath = String(shell.which('jbang') || 
						 (process.platform === 'win32' && shell.which('./jbang.cmd')) || 
						 shell.which('./jbang'));

	if (jbangPath) {
		debug('found existing jbang installation at %s', jbangPath);
		try {
			await spawnJbang(jbangPath, args);
		} catch (err) {
			debug('command execution failed: %o', err);
			throw err;
		}
	} else if (shell.which('curl') && shell.which('bash')) {
		debug('installing jbang using curl and bash');
		const installProcess = spawn('curl', ['-Ls', 'https://sh.jbang.dev', '|', 'bash', '-s', '-', ...args], {
			stdio: 'inherit',
			shell: true
		});
		
		return new Promise((resolve, reject) => {
			installProcess.on('close', (code) => {
				if (code === 0) {
					debug('installation completed successfully');
					resolve();
				} else {
					debug('installation failed with code: %d', code);
					reject(new Error(`Installation failed with code ${code}`));
				}
			});
		});
	} else if (shell.which('powershell')) {
		debug('installing jbang using PowerShell');
		const scriptContent = 'iex "& { $(iwr -useb https://ps.jbang.dev) } $args"';
		const tempScript = '%TEMP%/jbang.ps1';
		
		// Write the script
		debug('writing temporary PowerShell script');
		shell.exec(`echo ${scriptContent} > ${tempScript}`);
		
		// Execute the script
		const powershellProcess = spawn('powershell', ['-Command', `${tempScript} ${argLine}`], {
			stdio: 'inherit',
			shell: true
		});
		
		return new Promise((resolve, reject) => {
			powershellProcess.on('close', (code) => {
				if (code === 0) {
					debug('PowerShell installation completed successfully');
					resolve();
				} else {
					debug('PowerShell execution failed with code: %d', code);
					reject(new Error(`Powershell execution failed with code ${code}`));
				}
			});
		});
	} else {
		const err = new Error('unable to pre-install jbang: ' + argLine);
		debug('error: %o', err);
		throw err;
	}
};

// Sync version with proper terminal interaction
jbang.exec = function (...args) {
	const argLine = args.join(" ");
	debug('executing sync command: %s', argLine);
	
	const jbangPath = String(shell.which('jbang') || 
					 (process.platform === 'win32' && shell.which('./jbang.cmd')) || 
					 shell.which('./jbang'));

	if (jbangPath) {
		debug('found existing jbang installation at %s', jbangPath);
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
		const scriptContent = 'iex "& { $(iwr -useb https://ps.jbang.dev) } $args"';
		const tempScript = '%TEMP%/jbang.ps1';
		
		// Write the script
		debug('writing temporary PowerShell script');
		shell.exec(`echo ${scriptContent} > ${tempScript}`);
		
		// Execute the script
		const result = spawnSync('powershell', ['-Command', `${tempScript} ${argLine}`], {
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
