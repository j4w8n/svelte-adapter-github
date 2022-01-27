# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing to see here

## [v0.0.0-next]

### Added

- `jekyll` adapter option, as type boolean. Defaults to `false`, which creates an empty `.nojekyll` file in the build directory. If set to `true`, the file is not created.
- `domain` adapter option, as type string. Provide this value if you're using a custom domain in GitHub Pages. If passed, it creates a CNAME file in the build directory; with the value as the file's contents. Ex, `example.com`.
- mostly everything from the contributors of @sveltejs/adapter-static

### Changed

- default `pages` adapter option, from `build` to `docs`. This matches the GitHub Pages alternative folder, `/docs`, that you'll likely be using to source your site's files.

[Unreleased]: https://github.com/malynium/svelte-adapter-github/compare/v0.0.0-next...HEAD
[v0.0.0-next]: https://github.com/malynium/svelte-adapter-github/releases/tag/v0.0.0-next