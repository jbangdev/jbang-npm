const shell = require('shelljs');
const jbang = {};
jbang.exec = function (...args) {
	argLine = args.join(" ");
	if (shell.which('jbang')
		|| (process.platform === 'win32' && shell.which('./jbang.cmd')) // windows
		|| shell.which('./jbang')) {
		console.log('using jbang:', argLine);
		shell.exec('jbang ' + argLine);
	} else if (shell.which('curl') && shell.which('bash')) {
		console.log('using curl + bash:', argLine);
		shell.exec('curl -Ls https://sh.jbang.dev | bash -s - ' + argLine);
	} else if (shell.which('powershell')) {
		console.log('using powershell:', argLine);
		shell.exec('echo iex "& { $(iwr -useb https://ps.jbang.dev) } $args" > %TEMP%/jbang.ps1');
		shell.exec('powershell -Command "%TEMP%/jbang.ps1 ' + argLine + '"');
	} else {
		shell.echo('unable to pre-install jbang:', argLine);
		shell.exit(1);
	}
};

//todo: provide more typesafe/argsafe variations with run...
module.exports = jbang;
