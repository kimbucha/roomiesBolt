# AST Generator for LLM Consumption

This tool generates an Abstract Syntax Tree (AST) analysis of the Roomies codebase and formats it specifically for LLM consumption. It extracts key information about the codebase structure, components, types, and relationships, making it easier for LLMs to understand and reason about the codebase.

## What is an AST?

An Abstract Syntax Tree (AST) is a tree representation of the abstract syntactic structure of source code. Each node of the tree denotes a construct occurring in the source code. The AST is used by compilers and other tools to understand and analyze code.

## Features

- Parses all TypeScript/JavaScript files in the codebase
- Extracts key information about components, functions, types, and imports
- Generates markdown files formatted specifically for LLM consumption
- Provides directory structure and import relationships
- Optimized for performance and memory usage

## Usage

### Generating the AST for LLM Consumption

1. Make sure you have Node.js and npm installed
2. Run one of the AST generator scripts:

**Standard version:**
```bash
./scripts/generate-ast-llm.sh
```

**Memory-optimized version (recommended for large codebases):**
```bash
./scripts/generate-ast-llm-optimized.sh
```

Both scripts will:
- Parse all TypeScript files in the project
- Extract key information about the codebase
- Generate markdown files formatted for LLM consumption
- Save the output to the `ast-output-llm` directory

The memory-optimized version allocates more memory (4GB) to the Node.js process, which helps prevent out-of-memory errors when processing large codebases.

## Output Files

The script generates the following files in the `ast-output-llm` directory:

- `codebase-summary.md`: Summary of the codebase structure, including file counts, directory counts, and code statistics
- `components.md`: List of React components with their locations and properties
- `types.md`: List of type definitions (interfaces, type aliases) with their properties and relationships
- `imports.md`: Import relationships between files
- `directory-structure.md`: Directory structure of the codebase
- `file-summaries.json`: Raw data for further processing

### Viewing the Generated Files

You can use the included viewer script to easily browse the generated files:

```bash
./scripts/view-ast-llm.sh
```

This will display a menu that allows you to select and view each of the generated files.

## For LLM Consumption

The output files are specifically formatted for LLM consumption:

1. **Structured Information**: Clear headings, lists, and code blocks make it easy for LLMs to parse and understand the content.
2. **Contextual Data**: File paths, relationships, and hierarchies provide context for understanding the codebase structure.
3. **Semantic Content**: Component names, type definitions, and import relationships help LLMs understand the semantic meaning of the code.

You can feed these files directly to an LLM to:
- Understand the codebase structure and organization
- Analyze component relationships and dependencies
- Identify patterns and architectural decisions
- Generate documentation or plan refactoring

## Example Usage with an LLM

Here are some example prompts you can use with an LLM after generating the AST:

1. "Based on the codebase-summary.md, what is the overall structure of the Roomies application?"
2. "Looking at components.md, what are the main React components in the application and how are they organized?"
3. "Based on types.md, what are the key data structures used in the application?"
4. "Using imports.md, can you identify the most important modules in the application based on import frequency?"
5. "Based on directory-structure.md, how is the codebase organized? What architectural patterns do you observe?"

## Troubleshooting

### Memory Issues

If the script freezes or crashes due to memory issues:

1. Use the memory-optimized script: `./scripts/generate-ast-llm-optimized.sh`
2. Close other memory-intensive applications while running the script
3. If still experiencing issues, increase the memory allocation further by editing the script and changing `--max-old-space-size=4096` to a higher value (e.g., 6144 or 8192)
4. Run the script on a machine with more RAM

### Other Issues

1. Make sure all dependencies are installed: `npm install`
2. Check that TypeScript files are being found correctly
3. If you see TypeScript errors, make sure you have the correct TypeScript version installed: `npm install typescript@latest`
4. For specific parsing errors, you might need to modify the AST generator script to handle edge cases in your codebase
