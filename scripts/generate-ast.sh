#!/bin/bash

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Check if ts-node is installed
if ! command -v npx &> /dev/null; then
  echo "Error: npx is not installed. Please install Node.js and npm."
  exit 1
fi

# Create output directory if it doesn't exist
mkdir -p ast-output

echo "Starting AST generation..."
echo "This may take a few minutes depending on the size of the codebase."

# Run the TypeScript script using ts-node
npx ts-node scripts/generate-ast.ts

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo ""
  echo "AST generation completed successfully!"
  echo ""
  echo "The AST data has been saved to the ast-output directory."
  echo ""
  echo "To visualize the AST in Neo4j:"
  echo "1. Install Neo4j Desktop from https://neo4j.com/download/"
  echo "2. Create a new database and install the APOC plugin"
  echo "3. Copy neo4j-nodes.json and neo4j-relationships.json to your Neo4j import directory"
  echo "4. Update the file paths in neo4j-import.cypher"
  echo "5. Run the Cypher script in Neo4j Browser"
  echo ""
  echo "For more visualization options, see ast-output/visualization-recommendations.md"
else
  echo "Error: AST generation failed."
  exit 1
fi
