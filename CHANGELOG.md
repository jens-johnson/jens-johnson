# Changelog

## [0.5.0](https://github.com/jens-johnson/jens-johnson/compare/v0.4.0...v0.5.0) (2026-07-10)


### ✨ Features

* **file-header:** add an api handler file type with a request/response contract ([33b2158](https://github.com/jens-johnson/jens-johnson/commit/33b215876d35d27ca13eff652fc1b882532448a9))

## [0.4.0](https://github.com/jens-johnson/jens-johnson/compare/v0.3.1...v0.4.0) (2026-07-10)


### ✨ Features

* **configs:** vue template rules, shared props type, and idempotent vue header writes ([345afb0](https://github.com/jens-johnson/jens-johnson/commit/345afb0a6996918517afab441a9b8676bce80b6c))

## [0.3.1](https://github.com/jens-johnson/jens-johnson/compare/v0.3.0...v0.3.1) (2026-07-10)


### ♻️ Refactors

* **style-guide:** colocate unit tests with their subject files ([822071f](https://github.com/jens-johnson/jens-johnson/commit/822071f02c3d3c85640d0e4b37660fc6f7c2017a))

## [0.3.0](https://github.com/jens-johnson/jens-johnson/compare/v0.2.0...v0.3.0) (2026-07-10)


### ✨ Features

* **configs:** add a framework-aware eslint factory for nuxt consumers ([ab7d5cf](https://github.com/jens-johnson/jens-johnson/commit/ab7d5cfec43149f2039d04dcacd7f472a0d66fb9))
* **configs:** enforce always-brace and explicit function return types ([c9b6bee](https://github.com/jens-johnson/jens-johnson/commit/c9b6bee175830a5fff419d04da21ac6fc722045e))
* **repo:** add direnv shell environment with node pinning and command wrappers ([f63d29f](https://github.com/jens-johnson/jens-johnson/commit/f63d29f949b74e86409c98ef4a6270439c088943))


### 🐛 Bug Fixes

* **file-header:** avoid a check-then-use race when reading the target file ([0bd48d1](https://github.com/jens-johnson/jens-johnson/commit/0bd48d132c338b2b1a5c5d2190c06fb63065192b))
* **file-header:** preserve indentation and blank-line spacing in generated headers ([bd6db14](https://github.com/jens-johnson/jens-johnson/commit/bd6db1415fa2b52a77f8c1b9637fdf04ee8a870d))


### 👷 CI

* watch node lts releases and open a bump issue when the pin goes stale ([f956a1e](https://github.com/jens-johnson/jens-johnson/commit/f956a1e301842e9d421b03ca3cf930c2f8a07a1b))


### 🔧 Chores

* **docs:** update dev docs ([f5df3f1](https://github.com/jens-johnson/jens-johnson/commit/f5df3f12affd922301362bf17164941e5d0d8ff7))

## [0.2.0](https://github.com/jens-johnson/jens-johnson/compare/v0.1.0...v0.2.0) (2026-07-09)


### ✨ Features

* **configs:** add shareable prettier, eslint, stylelint, commitlint, and tsconfig exports ([7c662a6](https://github.com/jens-johnson/jens-johnson/commit/7c662a6d33a9450a00e63d47db5a1d471bf2ce53))
* **file-header:** add the ascii file-header generator module and cli ([ef0e36b](https://github.com/jens-johnson/jens-johnson/commit/ef0e36b8a0e1bca4d53eca3f3606b7f507034e1b))


### 🐛 Bug Fixes

* **ci:** exempt release-please generated files from prettier ([a53aea0](https://github.com/jens-johnson/jens-johnson/commit/a53aea0f65fc16e7c3b9cd620e1537b9edc38df4))
* **ci:** make release-please pr titles conform to the commitlint scope enum ([75d7381](https://github.com/jens-johnson/jens-johnson/commit/75d73817d8f2ef85a7ce589dd799208b07d98c04))
* **configs:** exempt dependabot commits from the commitlint lowercase rule ([4957215](https://github.com/jens-johnson/jens-johnson/commit/4957215fc374081014e3a7dd3652d7ee18e66fcd))


### 📝 Docs

* **repo:** add the repository maintenance overview ([9511cd5](https://github.com/jens-johnson/jens-johnson/commit/9511cd5ca88014a967571f9c4122167e301ac732))
* **style-guide:** add the complete developer style guide ([80b4726](https://github.com/jens-johnson/jens-johnson/commit/80b4726c0071d2f3379d3774b770527abadd5561))


### 👷 CI

* add validation, codeql, and release workflows with dependabot ([6c73c50](https://github.com/jens-johnson/jens-johnson/commit/6c73c50dc1fe2b616313d56ec2c8b701f635ec03))
* give dependabot conventional commit messages ([4f5036a](https://github.com/jens-johnson/jens-johnson/commit/4f5036a190e673023faf12de034511774b127b76))
* prefer a pat for release-please so release pr checks trigger ([4bdf4de](https://github.com/jens-johnson/jens-johnson/commit/4bdf4decae28c81938d86855d037e8a6e93213ab))


### 🔧 Chores

* **deps:** bump @commitlint/cli from 19.8.1 to 21.2.1 ([#4](https://github.com/jens-johnson/jens-johnson/issues/4)) ([994ae09](https://github.com/jens-johnson/jens-johnson/commit/994ae09021482351bc1e45df9a0037bb24579e3f))
* **deps:** bump @commitlint/config-conventional from 19.8.1 to 21.2.0 ([#7](https://github.com/jens-johnson/jens-johnson/issues/7)) ([fc18db6](https://github.com/jens-johnson/jens-johnson/commit/fc18db623b2ba587b93e0ed3756eded678a00274))
* **deps:** bump @stylistic/eslint-plugin from 4.4.1 to 5.10.0 ([#10](https://github.com/jens-johnson/jens-johnson/issues/10)) ([8ff409e](https://github.com/jens-johnson/jens-johnson/commit/8ff409e034aeb72042378f2aa61a0649e483759d))
* **deps:** bump eslint-plugin-simple-import-sort from 12.1.1 to 13.0.0 ([#6](https://github.com/jens-johnson/jens-johnson/issues/6)) ([5e65f4f](https://github.com/jens-johnson/jens-johnson/commit/5e65f4ff5d026fe8cf434798a6ecfc721566630d))
* **deps:** bump eslint-plugin-sonarjs from 3.0.7 to 4.1.0 ([#8](https://github.com/jens-johnson/jens-johnson/issues/8)) ([4abb02a](https://github.com/jens-johnson/jens-johnson/commit/4abb02a60508508b113b4909180eb9eebfb7187c))
* **deps:** bump globals from 16.5.0 to 17.7.0 ([#11](https://github.com/jens-johnson/jens-johnson/issues/11)) ([2469966](https://github.com/jens-johnson/jens-johnson/commit/24699663cd088983ffc92b98e4be8a49f500d956))
* **deps:** bump lefthook from 1.13.6 to 2.1.10 ([#9](https://github.com/jens-johnson/jens-johnson/issues/9)) ([47f63e1](https://github.com/jens-johnson/jens-johnson/commit/47f63e1e4f47350551fff87d6539c429e303b2f3))
* **deps:** bump stylelint-config-standard from 37.0.0 to 40.0.0 ([#5](https://github.com/jens-johnson/jens-johnson/issues/5)) ([c699c55](https://github.com/jens-johnson/jens-johnson/commit/c699c55bf2fa0bfad1b590e5589fd763db9d5f48))
* **deps:** bump typescript from 5.9.3 to 6.0.3 ([48af5c3](https://github.com/jens-johnson/jens-johnson/commit/48af5c38e605897fff18df0994ab9452f4f22c80))
* **repo:** wire the package manifest, root tooling configs, and git hooks ([ddaf1fa](https://github.com/jens-johnson/jens-johnson/commit/ddaf1fa481355e4989c7ecb52ba54694a64089e5))
