const shell = require('shelljs');
const { spawn } = require('child_process');
const jbang = {};

/** Implementing spawnn to ensure terminal interaction works */
function spawnJbang(args) {
	return new Promise((resolve, reject) => {
		const jbangPath = String(shell.which('jbang') || 
						 (process.platform === 'win32' && shell.which('./jbang.cmd')) || 
						 './jbang');
		
		const jbangProcess = spawn(jbangPath, args, {
			stdio: 'inherit',  // This ensures terminal interaction works
			shell: true       // This ensures the command works on Windows too
		});

		jbangProcess.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`The command failed with code ${code}`));
			}
		});

		jbangProcess.on('error', (err) => {
			reject(err);
		});
	});
}

jbang.exec = async function (...args) {
	const argLine = args.join(" ");
	
	if (shell.which('jbang') || 
		(process.platform === 'win32' && shell.which('./jbang.cmd')) || 
		shell.which('./jbang')) {
		try {
			await spawnJbang(args);
		} catch (err) {
			throw err;
		}
	} else if (shell.which('curl') && shell.which('bash')) {
		const installProcess = spawn('curl', ['-Ls', 'https://sh.jbang.dev', '|', 'bash', '-s', '-', ...args], {
			stdio: 'inherit',
			shell: true
		});
		
		return new Promise((resolve, reject) => {
			installProcess.on('close', (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Installation failed with code ${code}`));
				}
			});
		});
	} else if (shell.which('powershell')) {
		const scriptContent = 'iex "& { $(iwr -useb https://ps.jbang.dev) } $args"';
		const tempScript = '%TEMP%/jbang.ps1';
		
		// Write the script
		shell.exec(`echo ${scriptContent} > ${tempScript}`);
		
		// Execute the script
		const powershellProcess = spawn('powershell', ['-Command', `${tempScript} ${argLine}`], {
			stdio: 'inherit',
			shell: true
		});
		
		return new Promise((resolve, reject) => {
			powershellProcess.on('close', (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Powershell execution failed with code ${code}`));
				}
			});
		});
	} else {
		throw new Error('unable to pre-install jbang: ' + argLine);
	}
};

//todo: provide more typesafe/argsafe variations with run...
module.exports = jbang;
