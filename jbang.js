const shell = require('shelljs');
const { spawn, spawnSync } = require('child_process');
const jbang = {};

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
	const jbangPath = String(shell.which('jbang') || 
					 (process.platform === 'win32' && shell.which('./jbang.cmd')) || 
					 shell.which('./jbang'));

	if (jbangPath) {
		const result = spawnSync(jbangPath, args, {
			stdio: 'inherit',
			shell: true
		});

		if (result.status !== 0) {
			throw new Error(`The command failed with code ${result.status}`);
		}
		return result;
	} else if (shell.which('curl') && shell.which('bash')) {
		const result = spawnSync('curl', ['-Ls', 'https://sh.jbang.dev', '|', 'bash', '-s', '-', ...args], {
			stdio: 'inherit',
			shell: true
		});

		if (result.status !== 0) {
			throw new Error(`Installation failed with code ${result.status}`);
		}
		return result;
	} else if (shell.which('powershell')) {
		const scriptContent = 'iex "& { $(iwr -useb https://ps.jbang.dev) } $args"';
		const tempScript = '%TEMP%/jbang.ps1';
		
		// Write the script
		shell.exec(`echo ${scriptContent} > ${tempScript}`);
		
		// Execute the script
		const result = spawnSync('powershell', ['-Command', `${tempScript} ${argLine}`], {
			stdio: 'inherit',
			shell: true
		});

		if (result.status !== 0) {
			throw new Error(`Powershell execution failed with code ${result.status}`);
		}
		return result;
	} else {
		throw new Error('unable to pre-install jbang: ' + argLine);
	}
};

//todo: provide more typesafe/argsafe variations with run...
module.exports = jbang;
