# jbang-npm
Install and use [JBang](https://www.jbang.dev) from npm based projects

## Usage
The `jbang.exec()` function accepts a string that will be passed as the command-line arguments to the `jbang` executable.

Given this script `test.js`:

```js
#! /usr/bin/env node
const jbang = require('@jbang/jbang');
jbang.exec('properties@jbangdev');
```

And in `package.json`:

```json
{
  "scripts": {
    "test": "node test.js"
  },
  "devDependencies": {
    "@jbang/jbang": "^0.1.0"
  }
}
```

When you run `npm install` - JBang and other dependencies will be installed via the [npm `preinstall`](https://docs.npmjs.com/cli/v8/using-npm/scripts#npm-install) hook. This uses the [`app setup`](https://www.jbang.dev/documentation/guide/latest/installation.html#using-jbang) command.

Opening a new terminal or shell may be required to be able to use the `jbang` command from the system `PATH`.

## Using as a dependency
In most cases you should be able to use JBang directly in node scripts.

But if you want to provide more customization you can create your own "wrapper" NPM package. One of the advantages is that you can pre-install the library dependencies needed at the time of `npm install` (just by calling `--help` or a similar "no op" command) so that the user-experience when running the first command after install is better.

For an example, refer to the [`@karatelabs/karate`](https://github.com/karatelabs/karate-npm) NPM package.

