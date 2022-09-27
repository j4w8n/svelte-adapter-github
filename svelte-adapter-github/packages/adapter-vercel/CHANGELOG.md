# @sveltejs/adapter-vercel

## 1.0.0-next.77

### Patch Changes

- Redact error message if `getRequest` fails ([#6936](https://github.com/sveltejs/kit/pull/6936))

## 1.0.0-next.76

### Patch Changes

- [chore] bump esbuild ([#6829](https://github.com/sveltejs/kit/pull/6829))

## 1.0.0-next.75

### Patch Changes

- Ignore warnings when traced file fails to parse ([#6810](https://github.com/sveltejs/kit/pull/6810))

## 1.0.0-next.74

### Patch Changes

- Update to esbuild 0.15 ([#6740](https://github.com/sveltejs/kit/pull/6740))

## 1.0.0-next.73

### Patch Changes

- [breaking] request creation cleanup ([#6681](https://github.com/sveltejs/kit/pull/6681))

## 1.0.0-next.72

### Patch Changes

- Fix `global is not defined` runtime error building with `edge: true` option ([#6425](https://github.com/sveltejs/kit/pull/6425))

## 1.0.0-next.71

### Patch Changes

- Use devalue to serialize server-only `load` return values ([#6318](https://github.com/sveltejs/kit/pull/6318))

## 1.0.0-next.70

### Patch Changes

- Don't use top-level-await, as it is not supported right now ([#6360](https://github.com/sveltejs/kit/pull/6360))

## 1.0.0-next.69

### Patch Changes

- Run `server.init()` for edge functions ([#6327](https://github.com/sveltejs/kit/pull/6327))

## 1.0.0-next.68

### Patch Changes

- [feat] Moved hooks.js initialization from Server.respond into Server.init ([#6179](https://github.com/sveltejs/kit/pull/6179))

## 1.0.0-next.67

### Patch Changes

- Use `platform: 'browser'` for esbuild in Vercel Edge Functions. ([#6109](https://github.com/sveltejs/kit/pull/6109))

## 1.0.0-next.66

### Patch Changes

- Initialise `env` ([#5663](https://github.com/sveltejs/kit/pull/5663))

## 1.0.0-next.65

### Patch Changes

- [breaking] remove writeStatic to align with Vite ([#5618](https://github.com/sveltejs/kit/pull/5618))

## 1.0.0-next.64

### Patch Changes

- Don't remove .vercel/output directory ([#5555](https://github.com/sveltejs/kit/pull/5555))

## 1.0.0-next.63

### Patch Changes

- Print friendlier message if adapter-vercel fails to resolve dependencies ([#5551](https://github.com/sveltejs/kit/pull/5551))

## 1.0.0-next.62

### Patch Changes

- Update dependencies ([#5005](https://github.com/sveltejs/kit/pull/5005))

## 1.0.0-next.61

### Patch Changes

- Remove ENABLE_VC_BUILD check, use v3 build output API for all apps deployed to Vercel ([#5514](https://github.com/sveltejs/kit/pull/5514))

## 1.0.0-next.60

### Patch Changes

- [chore] upgrade TypeScript to 4.7.4 ([#5414](https://github.com/sveltejs/kit/pull/5414))

## 1.0.0-next.59

### Patch Changes

- Add sourcemap generation for the generated functions ([#5197](https://github.com/sveltejs/kit/pull/5197))

## 1.0.0-next.58

### Patch Changes

- Update dependencies ([#5121](https://github.com/sveltejs/kit/pull/5121))

## 1.0.0-next.57

### Patch Changes

- Update adapter entrypoint typings to be NodeNext/ESNext-compatible ([#5111](https://github.com/sveltejs/kit/pull/5111))

## 1.0.0-next.56

### Patch Changes

- Use @vercel/nft to include dependencies in lambda without bundling with esbuild, when using v3 build output API ([#4969](https://github.com/sveltejs/kit/pull/4969))

* only serve `_app/immutable` with immutable cache header, not `_app/version.json` ([#5051](https://github.com/sveltejs/kit/pull/5051))

## 1.0.0-next.55

### Patch Changes

- Add types to pkg.exports ([#5045](https://github.com/sveltejs/kit/pull/5045))

## 1.0.0-next.54

### Patch Changes

- [breaking] replace @sveltejs/kit/install-fetch with @sveltejs/kit/node/polyfills ([#4934](https://github.com/sveltejs/kit/pull/4934))

## 1.0.0-next.53

### Patch Changes

- Revert to cjs mode when building for lambda ([#4967](https://github.com/sveltejs/kit/pull/4967))

## 1.0.0-next.52

### Patch Changes

- [breaking] drop Node 14 support ([#4922](https://github.com/sveltejs/kit/pull/4922))

* Use general purpose Edge Functions instead of piggybacking Middleware for Edge Deployment + fix split mode ([#4883](https://github.com/sveltejs/kit/pull/4883))

## 1.0.0-next.51

### Patch Changes

- Support for Node.js 16 ([#4904](https://github.com/sveltejs/kit/pull/4904))

* The output of serverless now is ESM instead of CJS ([#4904](https://github.com/sveltejs/kit/pull/4904))

## 1.0.0-next.50

### Patch Changes

- Fix `edge: true, split: true` build error for root routes when deploying to Vercel ([#4731](https://github.com/sveltejs/kit/pull/4731))

## 1.0.0-next.49

### Patch Changes

- Remove unused target option from config.json ([#4678](https://github.com/sveltejs/kit/pull/4678))

## 1.0.0-next.48

### Patch Changes

- Support build output API, with edge functions and code-splitting ([#4663](https://github.com/sveltejs/kit/pull/4663))

## 1.0.0-next.47

### Patch Changes

- Provide getClientAddress function ([#4289](https://github.com/sveltejs/kit/pull/4289))

## 1.0.0-next.46

### Patch Changes

- [breaking] replace builder.prerender() with builder.writePrerendered() and builder.prerendered ([#4192](https://github.com/sveltejs/kit/pull/4192)) ([#4229](https://github.com/sveltejs/kit/pull/4229))

## 1.0.0-next.45

### Patch Changes

- Rename `__fetch_polyfill` to `installFetch` ([#4111](https://github.com/sveltejs/kit/pull/4111))

## 1.0.0-next.44

### Patch Changes

- [breaking] rename `app.render` to `server.respond` ([#4034](https://github.com/sveltejs/kit/pull/4034))

## 1.0.0-next.43

### Patch Changes

- Add prerendered routes to config ([#3822](https://github.com/sveltejs/kit/pull/3822))

## 1.0.0-next.42

### Patch Changes

- Clean URLs and handle trailingSlash configuration ([#3820](https://github.com/sveltejs/kit/pull/3820))

## 1.0.0-next.41

### Patch Changes

- update to Vite 2.8 and esbuild 0.14 ([#3791](https://github.com/sveltejs/kit/pull/3791))

## 1.0.0-next.40

### Patch Changes

- Expose external option ([#3614](https://github.com/sveltejs/kit/pull/3614))

## 1.0.0-next.39

### Patch Changes

- Breaking: change app.render signature to (request: Request) => Promise<Response> ([#3384](https://github.com/sveltejs/kit/pull/3384))

## 1.0.0-next.38

### Patch Changes

- Polyfill fetch before running any app code ([#3400](https://github.com/sveltejs/kit/pull/3400))

## 1.0.0-next.37

### Patch Changes

- Allow `__fetchPolyfill()` to run several times ([#3377](https://github.com/sveltejs/kit/pull/3377))

## 1.0.0-next.36

### Patch Changes

- Add immutable cache headers to generated assets ([#3222](https://github.com/sveltejs/kit/pull/3222))

## 1.0.0-next.35

### Patch Changes

- Use path.posix to resolve routes for esmodules ([#3200](https://github.com/sveltejs/kit/pull/3200))

## 1.0.0-next.34

### Patch Changes

- Revert to v1 filesystem API ([#3149](https://github.com/sveltejs/kit/pull/3149))

## 1.0.0-next.33

### Patch Changes

- Overhaul adapter API ([#2931](https://github.com/sveltejs/kit/pull/2931))

* Remove esbuild options ([#2931](https://github.com/sveltejs/kit/pull/2931))

- Update adapters to provide app.render with a url ([#3133](https://github.com/sveltejs/kit/pull/3133))

## 1.0.0-next.32

### Patch Changes

- update to esbuild 0.13.15 and other dependency updates ([#2957](https://github.com/sveltejs/kit/pull/2957))

## 1.0.0-next.31

### Patch Changes

- update dependencies ([#2574](https://github.com/sveltejs/kit/pull/2574))

## 1.0.0-next.30

### Patch Changes

- update to vite 2.6.0 and esbuild 0.13 ([#2522](https://github.com/sveltejs/kit/pull/2522))

## 1.0.0-next.29

### Patch Changes

- [chore] add links to repository and homepage to package.json ([#2425](https://github.com/sveltejs/kit/pull/2425))

## 1.0.0-next.28

### Patch Changes

- [chore] export package.json from adapters ([#2351](https://github.com/sveltejs/kit/pull/2351))

## 1.0.0-next.27

### Patch Changes

- d81de603: revert adapters automatically updating .gitignore ([#1924](https://github.com/sveltejs/kit/pull/1924))

## 1.0.0-next.26

### Patch Changes

- e9f78999: fix: include esbuild config in adapter type definition ([#1954](https://github.com/sveltejs/kit/pull/1954))

## 1.0.0-next.25

### Patch Changes

- e6995797: feat(adapters): expose esbuild configuration ([#1914](https://github.com/sveltejs/kit/pull/1914))

## 1.0.0-next.24

### Patch Changes

- 2ac5781: Use esbuild inject API to insert shims ([#1822](https://github.com/sveltejs/kit/pull/1822))

## 1.0.0-next.23

### Patch Changes

- 9f0c54a: Externalize app initialization to adapters ([#1804](https://github.com/sveltejs/kit/pull/1804))

## 1.0.0-next.22

### Patch Changes

- c51ab7d: Upgrade esbuild to ^0.12.5 ([#1627](https://github.com/sveltejs/kit/pull/1627))

## 1.0.0-next.21

### Patch Changes

- edc307d: Remove peerDependencies due to pnpm bug ([#1621](https://github.com/sveltejs/kit/pull/1621))
- 2636e68: Attempt to fix peerDependencies specification ([#1620](https://github.com/sveltejs/kit/pull/1620))

## 1.0.0-next.20

### Patch Changes

- c3d36a3: ensure `content-length` limit respected; handle `getRawBody` error(s) ([#1528](https://github.com/sveltejs/kit/pull/1528))
- 028abd9: Pass validated svelte config to adapter adapt function ([#1559](https://github.com/sveltejs/kit/pull/1559))
- Updated dependencies [6372690]
- Updated dependencies [c3d36a3]
- Updated dependencies [bf77940]
- Updated dependencies [2172469]
- Updated dependencies [028abd9]
  - @sveltejs/kit@1.0.0-next.110

## 1.0.0-next.19

### Patch Changes

- dca4946: Make kit a peerDependency of the adapters ([#1505](https://github.com/sveltejs/kit/pull/1505))
- Updated dependencies [261ee1c]
- Updated dependencies [ec156c6]
- Updated dependencies [586785d]
  - @sveltejs/kit@1.0.0-next.109

## 1.0.0-next.18

### Patch Changes

- dad93fc: Fix workspace dependencies ([#1434](https://github.com/sveltejs/kit/pull/1434))
- Updated dependencies [dad93fc]
- Updated dependencies [37fc04f]
  - @sveltejs/kit@1.0.0-next.108

## 1.0.0-next.17

### Patch Changes

- 9b448a6: Rename @sveltejs/kit/http to @sveltejs/kit/node ([#1391](https://github.com/sveltejs/kit/pull/1391))
- Updated dependencies [9b448a6]
  - @sveltejs/kit@1.0.0-next.104

## 1.0.0-next.16

### Patch Changes

- c6fde99: Convert to ESM ([#1323](https://github.com/sveltejs/kit/pull/1323))
- Updated dependencies [694f5de]
- Updated dependencies [0befffb]
- Updated dependencies [c6fde99]
  - @sveltejs/kit@1.0.0-next.97

## 1.0.0-next.15

### Patch Changes

- 2e72a94: Add type declarations ([#1230](https://github.com/sveltejs/kit/pull/1230))
- Updated dependencies [82955ec]
  - @sveltejs/kit@1.0.0-next.91

## 1.0.0-next.14

### Patch Changes

- 59f9277: fix body parsing ([#1146](https://github.com/sveltejs/kit/pull/1146))

## 1.0.0-next.13

### Patch Changes

- 1237eb3: Fix dependencies ([#1109](https://github.com/sveltejs/kit/pull/1109))
- 1237eb3: Use getRawBody in adapter-vercel ([#1109](https://github.com/sveltejs/kit/pull/1109))
- Updated dependencies [1237eb3]
- Updated dependencies [1237eb3]
  - @sveltejs/kit@1.0.0-next.81

## 1.0.0-next.12

### Patch Changes

- 7a4b351: Bundle serverless functions with esbuild ([#1091](https://github.com/sveltejs/kit/pull/1091))

## 1.0.0-next.11

### Patch Changes

- 6e27880: Move server-side fetch to adapters instead of build step ([#1066](https://github.com/sveltejs/kit/pull/1066))

## 1.0.0-next.10

### Patch Changes

- feb2db7: Simplify parsing of URLS of incoming requests ([#802](https://github.com/sveltejs/kit/pull/802))

## 1.0.0-next.9

### Patch Changes

- ca33a35: Fix adapter-vercel query parsing and update adapter-node's ([#774](https://github.com/sveltejs/kit/pull/774))

## 1.0.0-next.8

### Patch Changes

- 8024178: remove @sveltejs/app-utils ([#600](https://github.com/sveltejs/kit/pull/600))

## 1.0.0-next.7

### Patch Changes

- 17e82eb: Fix adapter-vercel imports ([#588](https://github.com/sveltejs/kit/pull/588))

## 1.0.0-next.6

### Patch Changes

- 8805c6d: Pass adapters directly to svelte.config.cjs ([#579](https://github.com/sveltejs/kit/pull/579))

## 1.0.0-next.5

### Patch Changes

- f35a5cd: Change adapter signature ([#505](https://github.com/sveltejs/kit/pull/505))

## 1.0.0-next.4

### Patch Changes

- c3cf3f3: Bump deps ([#492](https://github.com/sveltejs/kit/pull/492))
- d742029: Fix mixed usage of CJS and ESM ([#483](https://github.com/sveltejs/kit/pull/483))
- Updated dependencies [c3cf3f3]
  - @sveltejs/app-utils@1.0.0-next.3

## 1.0.0-next.3

### Patch Changes

- 8123929: Fix adapter-vercel using the wrong directory ([#450](https://github.com/sveltejs/kit/pull/450))
- Updated dependencies [73dd998]
- Updated dependencies [b800049]
  - @sveltejs/app-utils@1.0.0-next.2

## 1.0.0-next.2

### Patch Changes

- Fix adapters and convert to ES modules

## 1.0.0-next.1

### Patch Changes

- Update to new adapter API

## 0.0.3

### Patch Changes

- 67eaeea: Move app-utils stuff into subpackages

## 0.0.2

### Patch Changes

- Use setup

## 0.0.1

### Patch Changes

- 0320208: Rename 'server route' to 'endpoint'
- 5ca907c: Use shared mkdirp helper
