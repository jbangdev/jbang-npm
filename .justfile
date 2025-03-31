
# Run tests
test:
    # Run tests without jbang in PATH to ensure clean environment
    PATH=$(echo $PATH | tr ':' '\n' | grep -v "\.jbang/bin" | tr '\n' ':' | sed 's/:$//') npm test


# Create a new release using GitHub CLI
release:
    gh release create $(node -p "require('./package.json').version") --generate-notes
