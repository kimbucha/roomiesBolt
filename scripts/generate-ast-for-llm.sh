#!/bin/bash

# Make sure we're in the project root
cd "$(dirname "$0")/.."

echo "=== Generating AST for LLM Consumption ==="
echo ""

# Step 1: Generate the AST
echo "Step 1: Generating AST..."
./scripts/generate-ast.sh

# Check if AST generation was successful
if [ $? -ne 0 ]; then
  echo "Error: AST generation failed."
  exit 1
fi

echo ""
echo "Step 2: Extracting information for LLM consumption..."

# Step 2: Generate all LLM-friendly outputs
echo ""
echo "Generating codebase summary..."
node scripts/ast-for-llm.js summary

echo ""
echo "Generating React components list..."
node scripts/ast-for-llm.js components

echo ""
echo "Generating import relationships..."
node scripts/ast-for-llm.js imports

echo ""
echo "Generating type definitions..."
node scripts/ast-for-llm.js types

echo ""
echo "=== AST Generation and LLM Extraction Complete ==="
echo ""
echo "The following files have been generated in the ast-output directory:"
echo "- ast-graph.json: Complete AST graph"
echo "- neo4j-nodes.json: Nodes for Neo4j import"
echo "- neo4j-relationships.json: Relationships for Neo4j import"
echo "- neo4j-import.cypher: Cypher script for Neo4j import"
echo "- visualization-recommendations.md: Recommendations for visualization"
echo "- codebase-summary.md: Summary of the codebase structure for LLM consumption"
echo "- react-components.md: List of React components for LLM consumption"
echo "- import-relationships.md: Import relationships for LLM consumption"
echo "- type-definitions.md: Type definitions for LLM consumption"
echo ""
echo "To visualize the AST in Neo4j, follow the instructions in ast-README.md"
