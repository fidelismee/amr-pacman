# Build & Packaging Guardrail

## Strict Rule
The AI **MUST NOT** run, suggest running, or simulate any build, compile, package, or release commands **unless the user explicitly invokes the build workflow**.

## Prohibited Actions (Unless Explicitly Invoked)
Do NOT run or suggest:
- `npm run build`
- `npm run compile`
- `npm test`
- `npm run package`
- `vsce package`
- `code --install-extension *.vsix`
- Any CI/CD, bundling, or release-related command
- Any command that modifies `dist/`, `out/`, `build/`, `.vsix`, or compiled artifacts

## Allowed Actions Without Build Invocation
The AI MAY:
- Edit source code
- Refactor files
- Update configuration files
- Update documentation
- Prepare build instructions **without executing them**
- Ask the user to invoke the build workflow when needed

## Explicit Build Invocation Requirement
A build or packaging workflow may ONLY occur if the user uses **clear, direct language**, such as:
- “Run the build”
- “Invoke the build workflow”
- “Compile the project now”
- “Package the extension”
- “Create the VSIX”

If such language is not present, the AI MUST assume build execution is **forbidden**.

## Violation Handling
If a task would normally require a build step, the AI MUST:
1. Stop before executing any build-related action
2. Inform the user that a build invocation is required
3. Ask the user to explicitly approve or invoke the build workflow

## Priority
This rule has **higher priority than task completion convenience**.
Safety, reproducibility, and user control take precedence.
