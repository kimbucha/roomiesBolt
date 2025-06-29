#!/bin/bash

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Check if ts-node is installed
if ! command -v npx &> /dev/null; then
  echo "Error: npx is not installed. Please install Node.js and npm."
  exit 1
fi

echo "=== Generating AST for LLM Consumption ==="
echo ""

# Create output directory if it doesn't exist
mkdir -p ast-output-llm

echo "Starting AST analysis..."
echo "This may take a few minutes depending on the size of the codebase."

# Run the TypeScript script using ts-node
npx ts-node scripts/ast-for-llm-simple.ts

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo ""
  echo "AST analysis completed successfully!"
  echo ""
  echo "The following files have been generated in the ast-output-llm directory:"
  echo "- codebase-summary.md: Summary of the codebase structure"
  echo "- components.md: List of React components"
  echo "- types.md: List of type definitions"
  echo "- imports.md: Import relationships"
  echo "- directory-structure.md: Directory structure"
  echo "- file-summaries.json: Raw data for further processing"
  echo ""
  echo "These files are formatted specifically for LLM consumption."
else
  echo "Error: AST analysis failed."
  exit 1
fi
