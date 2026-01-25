# Development-Only Execution Rule

## Strict Rule
The AI is ONLY permitted to run development-time commands required to verify that the project compiles.

All build, package, release, or production commands are strictly forbidden unless explicitly authorized by the user.

## Allowed Command (Explicitly Whitelisted)
The AI MAY run:
- `npm run dev`

This is permitted ONLY for:
- Verifying that the project starts
- Checking that the code compiles successfully
- Identifying runtime or compile-time errors

## Explicitly Forbidden Actions
The AI MUST NOT run or suggest running:
- `npm run build`
- `npm run compile`
- `npm test`
- `npm run package`
- `vsce package`
- `code --install-extension *.vsix`
- Any CI/CD, bundling, or release-related command
- Any command that produces or modifies:
  - `dist/`
  - `out/`
  - `build/`
  - `.vsix`
  - Production or release artifacts

## No Artifact Guarantee
Running `npm run dev` must NOT be used to:
- Generate distributable files
- Produce production-ready artifacts
- Replace or imply a successful build

If `npm run dev` generates compiled output, the AI must treat this as **verification only**, not a build.

## Compile Check Definition
A "compile check" means:
- Ensuring the dev server starts without errors
- Ensuring TypeScript / bundler errors are surfaced
- Observing logs for compile failures

It does NOT mean:
- Producing optimized output
- Packaging
- Releasing
- Installing extensions

## Violation Handling
If a task requires a build, package, or release step, the AI MUST:
1. Stop execution
2. State that only `npm run dev` is permitted
3. Ask the user to explicitly invoke the build workflow

## Priority
This rule overrides convenience and task completion.
User-controlled execution is mandatory.
