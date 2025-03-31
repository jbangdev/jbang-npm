## Contributing to the project

Use github issues and pull requests.

### Making a release

0. Check the access token have not expired on https://www.npmjs.com/settings/<username>/tokens
1. Update the version in `package.json` and `package-lock.json`
2. Commit and push the changes
3. Create a new release on github using the version from `package.json` as the tag name
4. The release will be automatically published to npm
