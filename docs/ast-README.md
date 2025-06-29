# Abstract Syntax Tree (AST) Generator for Roomies Codebase

This tool generates an Abstract Syntax Tree (AST) of the entire Roomies codebase and exports it in a format suitable for visualization and analysis in Neo4j or other graph visualization tools.

## What is an AST?

An Abstract Syntax Tree (AST) is a tree representation of the abstract syntactic structure of source code. Each node of the tree denotes a construct occurring in the source code. The AST is used by compilers and other tools to understand and analyze code.

## Features

- Parses all TypeScript/JavaScript files in the codebase
- Generates a complete AST with detailed node information
- Creates a graph representation with nodes and relationships
- Exports data in formats suitable for Neo4j import
- Provides directory structure and import relationships
- Includes recommendations for visualization and LLM consumption

## Usage

### Generating the AST and LLM-Friendly Output (All-in-One)

1. Make sure you have Node.js and npm installed
2. Run the all-in-one script:

```bash
./scripts/generate-ast-for-llm.sh
```

This will:
- Parse all TypeScript files in the project
- Generate the complete AST
- Export the AST data to the `ast-output` directory
- Extract various LLM-friendly summaries and analyses
- Generate markdown files formatted specifically for LLM consumption

### Individual Steps (Alternative Approach)

If you prefer to run the steps individually:

1. Generate the AST:

```bash
./scripts/generate-ast.sh
```

2. Extract specific information for LLM consumption:

```bash
# Generate a summary of the codebase structure
node scripts/ast-for-llm.js summary

# List all React components
node scripts/ast-for-llm.js components

# Show import relationships
node scripts/ast-for-llm.js imports

# List all type definitions
node scripts/ast-for-llm.js types
```

Each command generates both console output and a markdown file in the `ast-output` directory that's formatted specifically for LLM consumption.

### Output Files

The script generates the following files in the `ast-output` directory:

- `ast-graph.json`: Complete AST graph with nodes and relationships
- `neo4j-nodes.json`: Nodes formatted for Neo4j import
- `neo4j-relationships.json`: Relationships formatted for Neo4j import
- `neo4j-import.cypher`: Cypher script for importing data into Neo4j
- `visualization-recommendations.md`: Detailed recommendations for visualization

## Visualizing the AST

### Using Neo4j (Recommended)

Neo4j is a graph database that provides powerful visualization and query capabilities, making it ideal for exploring the AST.

#### Automated Import (Recommended)

We provide a helper script to simplify the Neo4j import process:

```bash
./scripts/neo4j-import-helper.sh /path/to/neo4j/import
```

This script will:
1. Copy the Neo4j import files to the specified directory
2. Update the file paths in the Cypher script
3. Print instructions for importing the data into Neo4j

#### Manual Import

If you prefer to import the data manually:

1. Install [Neo4j Desktop](https://neo4j.com/download/)
2. Create a new database
3. Install the APOC plugin (required for importing JSON data)
4. Copy `neo4j-nodes.json` and `neo4j-relationships.json` to your Neo4j import directory
5. Update the file paths in `neo4j-import.cypher` to point to your import directory
6. Run the Cypher script in Neo4j Browser to import the data
7. Use Neo4j Browser to visualize and query the AST

### Alternative Visualization Options

#### AST Explorer (for individual files)

For exploring individual file ASTs:
- Use [AST Explorer](https://astexplorer.net/) and select TypeScript as the parser
- Paste the content of a file to see its AST

#### D3.js Visualization

For a custom web-based visualization:
- Use D3.js to create an interactive force-directed graph
- Convert the `ast-graph.json` to a D3-compatible format
- Implement zooming, filtering, and searching capabilities

#### Gephi

For offline visualization:
- Use [Gephi](https://gephi.org/) to import the graph data
- Apply layout algorithms like ForceAtlas2
- Use node size, color, and labels to represent different aspects of the AST

## For LLM Consumption

For LLM analysis of the AST:

1. **JSON Format**: The `ast-graph.json` file contains the complete AST in a structured JSON format that LLMs can process.

2. **Cypher Queries**: Use Neo4j's Cypher query language to extract specific patterns or subgraphs from the AST, then provide these results to the LLM.

3. **Summarization**: Generate summaries of the AST structure, such as:
   - File and directory counts
   - Component hierarchies
   - Import/export relationships
   - Type definitions and their usage

4. **Chunking**: Break down the AST into logical chunks based on:
   - Directory structure
   - Module boundaries
   - Component hierarchies
   - Functional areas

5. **Vector Embeddings**: Create vector embeddings of code snippets associated with AST nodes for semantic search and similarity analysis.

## Neo4j Schema

The Neo4j schema uses the following node labels:
- File: Source code files
- Directory: Filesystem directories
- Various AST node types (FunctionDeclaration, ClassDeclaration, etc.)

And relationship types:
- CHILD_OF: AST parent-child relationships
- CONTAINED_IN: File to directory relationships
- SUBDIRECTORY_OF: Directory hierarchy
- IMPORTS: Import relationships between files

This schema allows for powerful queries to analyze:
- Code structure and organization
- Dependencies between components
- Patterns in the codebase
- Impact analysis for changes

## Example Queries

Once the data is imported into Neo4j, you can run queries like:

```cypher
// Get all files
MATCH (f:File) 
RETURN f.fileName, f.filePath 
ORDER BY f.fileName;

// Get file structure
MATCH (d:Directory)<-[:SUBDIRECTORY_OF*0..]-(subdir:Directory)<-[:CONTAINED_IN]-(f:File)
WHERE d.name = "Roomies"
RETURN d.name as root, subdir.name as directory, collect(f.fileName) as files;

// Find all React components
MATCH (f:File)-[:CONTAINED_IN]->(d:Directory)
WHERE f.fileName ENDS WITH ".tsx"
MATCH (f)<-[:CHILD_OF*]-(c)
WHERE "FunctionDeclaration" IN c.labels OR "ArrowFunction" IN c.labels
RETURN f.fileName, d.name as directory, collect(c.functionName) as components;

// Find import dependencies
MATCH (f1:File)<-[:CHILD_OF*]-(:Import)-[:IMPORTS]->(f2:File)
RETURN f1.fileName as importingFile, f2.fileName as importedFile, count(*) as importCount
ORDER BY importCount DESC;
```

## Customization

You can modify the `scripts/generate-ast.ts` file to customize the AST generation process:

- Add additional node types to extract
- Modify the properties captured for each node
- Change the relationship types
- Adjust the output format

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed: `npm install`
2. Check that TypeScript files are being found correctly
3. Verify that the output directory exists and is writable
4. For Neo4j import issues, ensure the APOC plugin is installed and file paths are correct
