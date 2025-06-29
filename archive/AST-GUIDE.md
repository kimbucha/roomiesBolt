# AST Generation and Analysis Guide

This guide provides an overview of the tools created to generate, visualize, and analyze the Abstract Syntax Tree (AST) of the Roomies codebase.

## Quick Start

To generate the AST and prepare it for both Neo4j visualization and LLM consumption:

```bash
# Generate the AST and extract LLM-friendly information
./scripts/generate-ast-for-llm.sh

# Import the AST into Neo4j (replace with your Neo4j import directory)
./scripts/neo4j-import-helper.sh /path/to/neo4j/import
```

## Available Tools

We've created several tools to help you work with the AST:

1. **AST Generator** (`scripts/generate-ast.ts`):
   - Parses all TypeScript files in the project
   - Generates a complete AST with nodes and relationships
   - Exports the AST in a format suitable for Neo4j import

2. **LLM Data Extractor** (`scripts/ast-for-llm.js`):
   - Extracts specific information from the AST
   - Formats the data for LLM consumption
   - Generates markdown files with summaries and analyses

3. **All-in-One Script** (`scripts/generate-ast-for-llm.sh`):
   - Runs both the AST generator and LLM data extractor
   - Generates all output files in one go

4. **Neo4j Import Helper** (`scripts/neo4j-import-helper.sh`):
   - Simplifies the process of importing the AST into Neo4j
   - Updates file paths in the Cypher script
   - Provides instructions for running queries

## Output Files

The tools generate the following files in the `ast-output` directory:

### Neo4j Import Files
- `ast-graph.json`: Complete AST graph with nodes and relationships
- `neo4j-nodes.json`: Nodes formatted for Neo4j import
- `neo4j-relationships.json`: Relationships formatted for Neo4j import
- `neo4j-import.cypher`: Cypher script for importing data into Neo4j
- `visualization-recommendations.md`: Recommendations for visualization

### LLM-Friendly Files
- `codebase-summary.md`: Summary of the codebase structure
- `react-components.md`: List of React components
- `import-relationships.md`: Import relationships between files
- `type-definitions.md`: Type definitions in the codebase

## For LLM Analysis

The LLM-friendly files are specifically formatted for LLM consumption. They provide:

1. **Structured Information**: Clear headings, lists, and code blocks
2. **Contextual Data**: File paths, relationships, and hierarchies
3. **Semantic Content**: Code snippets, type definitions, and component structures

You can feed these files directly to an LLM to:
- Understand the codebase structure
- Analyze component relationships
- Identify patterns and dependencies
- Generate documentation
- Plan refactoring or feature additions

## For Neo4j Visualization

The Neo4j import files allow you to visualize and query the AST in Neo4j:

1. Use the Neo4j import helper to copy the files and update the Cypher script
2. Run the Cypher script in Neo4j Browser
3. Use the example queries to explore the AST

Neo4j visualization provides:
- Interactive graph exploration
- Powerful query capabilities
- Visual representation of code structure
- Dependency analysis
- Pattern identification

## Customization

You can customize the AST generation process by modifying:

- `scripts/generate-ast.ts`: Change what information is extracted from the AST
- `scripts/ast-for-llm.js`: Modify how the data is formatted for LLM consumption
- Neo4j queries: Create custom queries to extract specific information

## Further Documentation

For more detailed information, see:
- `ast-README.md`: Comprehensive documentation on all aspects of the AST tools
- `ast-output/visualization-recommendations.md`: Specific recommendations for visualization

## Next Steps

1. Run the all-in-one script to generate the AST and LLM-friendly files
2. Import the AST into Neo4j using the import helper
3. Explore the AST using Neo4j Browser
4. Use the LLM-friendly files with your preferred LLM
5. Customize the tools to extract additional information as needed
