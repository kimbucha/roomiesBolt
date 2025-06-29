import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';

// Interface for Neo4j node
interface Neo4jNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

// Interface for Neo4j relationship
interface Neo4jRelationship {
  id: string;
  type: string;
  startNode: string;
  endNode: string;
  properties: Record<string, any>;
}

// Interface for Neo4j graph data
interface Neo4jGraph {
  nodes: Neo4jNode[];
  relationships: Neo4jRelationship[];
}

// Counter for generating unique IDs
let nodeIdCounter = 0;
let relationshipIdCounter = 0;

// Function to generate a unique ID for nodes
function generateNodeId(): string {
  return `n${nodeIdCounter++}`;
}

// Function to generate a unique ID for relationships
function generateRelationshipId(): string {
  return `r${relationshipIdCounter++}`;
}

// Function to find all TypeScript files in a directory
async function findTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git')) {
      files.push(...await findTypeScriptFiles(fullPath));
    } else if (
      entry.isFile() && 
      (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) && 
      !fullPath.endsWith('.d.ts')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to create a Neo4j node from a TypeScript node
function createNeo4jNode(node: ts.Node, sourceFile: ts.SourceFile, filePath: string): Neo4jNode {
  const nodeId = generateNodeId();
  const syntaxKind = ts.SyntaxKind[node.kind];
  const startPos = node.getStart(sourceFile);
  const endPos = node.getEnd();
  const text = node.getText(sourceFile);
  const lineAndChar = sourceFile.getLineAndCharacterOfPosition(startPos);

  return {
    id: nodeId,
    labels: [syntaxKind],
    properties: {
      kind: node.kind,
      kindName: syntaxKind,
      text: text.length > 1000 ? text.substring(0, 1000) + '...' : text,
      startPos,
      endPos,
      line: lineAndChar.line + 1,
      column: lineAndChar.character + 1,
      filePath,
      fileName: path.basename(filePath),
    }
  };
}

// Function to process a TypeScript node and its children
function processNode(
  node: ts.Node, 
  sourceFile: ts.SourceFile, 
  filePath: string, 
  parentId: string | null,
  graph: Neo4jGraph
): string {
  // Create Neo4j node
  const neo4jNode = createNeo4jNode(node, sourceFile, filePath);
  graph.nodes.push(neo4jNode);
  
  // Create relationship to parent if it exists
  if (parentId !== null) {
    graph.relationships.push({
      id: generateRelationshipId(),
      type: 'CHILD_OF',
      startNode: neo4jNode.id,
      endNode: parentId,
      properties: {}
    });
  }
  
  // Process special node types to extract additional information
  if (ts.isIdentifier(node)) {
    neo4jNode.properties.name = node.text;
  } else if (ts.isClassDeclaration(node) && node.name) {
    neo4jNode.properties.className = node.name.text;
    neo4jNode.labels.push('Class');
  } else if (ts.isFunctionDeclaration(node) && node.name) {
    neo4jNode.properties.functionName = node.name.text;
    neo4jNode.labels.push('Function');
  } else if (ts.isMethodDeclaration(node) && node.name) {
    neo4jNode.properties.methodName = node.name.getText(sourceFile);
    neo4jNode.labels.push('Method');
  } else if (ts.isPropertyDeclaration(node) && node.name) {
    neo4jNode.properties.propertyName = node.name.getText(sourceFile);
    neo4jNode.labels.push('Property');
  } else if (ts.isInterfaceDeclaration(node)) {
    neo4jNode.properties.interfaceName = node.name.text;
    neo4jNode.labels.push('Interface');
  } else if (ts.isTypeAliasDeclaration(node)) {
    neo4jNode.properties.typeName = node.name.text;
    neo4jNode.labels.push('TypeAlias');
  } else if (ts.isImportDeclaration(node)) {
    if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      neo4jNode.properties.moduleSpecifier = node.moduleSpecifier.text;
    }
    neo4jNode.labels.push('Import');
  } else if (ts.isExportDeclaration(node)) {
    neo4jNode.labels.push('Export');
  } else if (ts.isVariableDeclaration(node) && node.name) {
    neo4jNode.properties.variableName = node.name.getText(sourceFile);
    neo4jNode.labels.push('Variable');
  } else if (ts.isCallExpression(node) && node.expression) {
    neo4jNode.properties.callName = node.expression.getText(sourceFile);
    neo4jNode.labels.push('CallExpression');
  } else if (ts.isJsxElement(node) && node.openingElement) {
    neo4jNode.properties.tagName = node.openingElement.tagName.getText(sourceFile);
    neo4jNode.labels.push('JsxElement');
  } else if (ts.isJsxSelfClosingElement(node)) {
    neo4jNode.properties.tagName = node.tagName.getText(sourceFile);
    neo4jNode.labels.push('JsxSelfClosingElement');
  }
  
  // Process children
  node.forEachChild(child => {
    processNode(child, sourceFile, filePath, neo4jNode.id, graph);
  });
  
  return neo4jNode.id;
}

// Function to process a TypeScript file
async function processFile(filePath: string, graph: Neo4jGraph): Promise<void> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      path.basename(filePath),
      fileContent,
      ts.ScriptTarget.Latest,
      true
    );
    
    // Create a file node
    const fileNode: Neo4jNode = {
      id: generateNodeId(),
      labels: ['File'],
      properties: {
        filePath,
        fileName: path.basename(filePath),
        fileSize: fileContent.length,
        extension: path.extname(filePath),
      }
    };
    graph.nodes.push(fileNode);
    
    // Process the source file
    processNode(sourceFile, sourceFile, filePath, fileNode.id, graph);
    
    console.log(`Processed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Main function
async function main() {
  try {
    const rootDir = process.cwd();
    const outputDir = path.join(rootDir, 'ast-output');
    
    // Create output directory if it doesn't exist
    await fs.ensureDir(outputDir);
    
    // Find all TypeScript files
    console.log('Finding TypeScript files...');
    const files = await findTypeScriptFiles(rootDir);
    console.log(`Found ${files.length} TypeScript files.`);
    
    // Initialize Neo4j graph
    const graph: Neo4jGraph = {
      nodes: [],
      relationships: []
    };
    
    // Process each file
    console.log('Processing files...');
    for (const file of files) {
      await processFile(file, graph);
    }
    
    // Add directory structure nodes and relationships
    console.log('Adding directory structure...');
    const directories = new Set<string>();
    
    // Collect all directories
    for (const node of graph.nodes) {
      if (node.labels.includes('File')) {
        const filePath = node.properties.filePath;
        let dirPath = path.dirname(filePath);
        
        while (dirPath !== rootDir && dirPath !== '.') {
          directories.add(dirPath);
          dirPath = path.dirname(dirPath);
        }
      }
    }
    
    // Add directory nodes
    const directoryNodes: Record<string, string> = {};
    for (const dir of directories) {
      const dirNode: Neo4jNode = {
        id: generateNodeId(),
        labels: ['Directory'],
        properties: {
          path: dir,
          name: path.basename(dir)
        }
      };
      graph.nodes.push(dirNode);
      directoryNodes[dir] = dirNode.id;
    }
    
    // Add root directory node
    const rootDirNode: Neo4jNode = {
      id: generateNodeId(),
      labels: ['Directory', 'RootDirectory'],
      properties: {
        path: rootDir,
        name: path.basename(rootDir)
      }
    };
    graph.nodes.push(rootDirNode);
    directoryNodes[rootDir] = rootDirNode.id;
    
    // Add directory relationships
    for (const dir of directories) {
      const parentDir = path.dirname(dir);
      if (directoryNodes[parentDir]) {
        graph.relationships.push({
          id: generateRelationshipId(),
          type: 'SUBDIRECTORY_OF',
          startNode: directoryNodes[dir],
          endNode: directoryNodes[parentDir],
          properties: {}
        });
      }
    }
    
    // Add file to directory relationships
    for (const node of graph.nodes) {
      if (node.labels.includes('File')) {
        const filePath = node.properties.filePath;
        const dirPath = path.dirname(filePath);
        
        if (directoryNodes[dirPath]) {
          graph.relationships.push({
            id: generateRelationshipId(),
            type: 'CONTAINED_IN',
            startNode: node.id,
            endNode: directoryNodes[dirPath],
            properties: {}
          });
        }
      }
    }
    
    // Add import relationships
    console.log('Adding import relationships...');
    for (const node of graph.nodes) {
      if (node.labels.includes('Import') && node.properties.moduleSpecifier) {
        const importingFilePath = node.properties.filePath;
        const moduleSpecifier = node.properties.moduleSpecifier;
        
        // Try to resolve the imported file
        let resolvedPath = '';
        
        if (moduleSpecifier.startsWith('.')) {
          // Relative import
          resolvedPath = path.resolve(path.dirname(importingFilePath), moduleSpecifier);
          
          // Try different extensions
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          for (const ext of extensions) {
            if (fs.existsSync(resolvedPath + ext)) {
              resolvedPath += ext;
              break;
            }
          }
          
          // Check if it's a directory with an index file
          if (!path.extname(resolvedPath)) {
            for (const ext of extensions) {
              const indexPath = path.join(resolvedPath, `index${ext}`);
              if (fs.existsSync(indexPath)) {
                resolvedPath = indexPath;
                break;
              }
            }
          }
        }
        
        // Find the target file node
        if (resolvedPath && fs.existsSync(resolvedPath)) {
          const targetFileNode = graph.nodes.find(n => 
            n.labels.includes('File') && n.properties.filePath === resolvedPath
          );
          
          if (targetFileNode) {
            graph.relationships.push({
              id: generateRelationshipId(),
              type: 'IMPORTS',
              startNode: node.id,
              endNode: targetFileNode.id,
              properties: {
                moduleSpecifier
              }
            });
          }
        }
      }
    }
    
    // Save the graph to files
    console.log('Saving output...');
    
    // Save full graph
    await fs.writeJson(path.join(outputDir, 'ast-graph.json'), graph, { spaces: 2 });
    
    // Save nodes and relationships separately for Neo4j import
    await fs.writeJson(path.join(outputDir, 'neo4j-nodes.json'), graph.nodes, { spaces: 2 });
    await fs.writeJson(path.join(outputDir, 'neo4j-relationships.json'), graph.relationships, { spaces: 2 });
    
    // Generate Cypher script for Neo4j import
    let cypherScript = '// Neo4j Cypher script for importing AST\n\n';
    
    // Clear database
    cypherScript += '// Clear existing data\n';
    cypherScript += 'MATCH (n) DETACH DELETE n;\n\n';
    
    // Create constraints
    cypherScript += '// Create constraints\n';
    cypherScript += 'CREATE CONSTRAINT IF NOT EXISTS FOR (n:File) REQUIRE n.filePath IS UNIQUE;\n';
    cypherScript += 'CREATE CONSTRAINT IF NOT EXISTS FOR (n:Directory) REQUIRE n.path IS UNIQUE;\n\n';
    
    // Load nodes
    cypherScript += '// Load nodes\n';
    cypherScript += 'CALL apoc.load.json("file:///path/to/neo4j-nodes.json") YIELD value\n';
    cypherScript += 'CALL apoc.create.node(value.labels, value.properties) YIELD node\n';
    cypherScript += 'WITH node, value.id as nodeId\n';
    cypherScript += 'CALL apoc.create.setProperty(node, "_id", nodeId) YIELD node as n\n';
    cypherScript += 'RETURN count(*);\n\n';
    
    // Load relationships
    cypherScript += '// Load relationships\n';
    cypherScript += 'CALL apoc.load.json("file:///path/to/neo4j-relationships.json") YIELD value\n';
    cypherScript += 'MATCH (start) WHERE start._id = value.startNode\n';
    cypherScript += 'MATCH (end) WHERE end._id = value.endNode\n';
    cypherScript += 'CALL apoc.create.relationship(start, value.type, value.properties, end) YIELD rel\n';
    cypherScript += 'RETURN count(*);\n\n';
    
    // Add useful queries
    cypherScript += '// Example queries\n\n';
    
    cypherScript += '// Get all files\n';
    cypherScript += 'MATCH (f:File) RETURN f.fileName, f.filePath ORDER BY f.fileName;\n\n';
    
    cypherScript += '// Get file structure\n';
    cypherScript += 'MATCH (d:Directory)<-[:SUBDIRECTORY_OF*0..]-(subdir:Directory)<-[:CONTAINED_IN]-(f:File)\n';
    cypherScript += 'WHERE d.name = "Roomies"\n';
    cypherScript += 'RETURN d.name as root, subdir.name as directory, collect(f.fileName) as files;\n\n';
    
    cypherScript += '// Find all React components\n';
    cypherScript += 'MATCH (f:File)-[:CONTAINED_IN]->(d:Directory)\n';
    cypherScript += 'WHERE f.fileName ENDS WITH ".tsx"\n';
    cypherScript += 'MATCH (f)<-[:CHILD_OF*]-(c)\n';
    cypherScript += 'WHERE "FunctionDeclaration" IN c.labels OR "ArrowFunction" IN c.labels\n';
    cypherScript += 'RETURN f.fileName, d.name as directory, collect(c.functionName) as components;\n\n';
    
    cypherScript += '// Find import dependencies\n';
    cypherScript += 'MATCH (f1:File)<-[:CHILD_OF*]-(:Import)-[:IMPORTS]->(f2:File)\n';
    cypherScript += 'RETURN f1.fileName as importingFile, f2.fileName as importedFile, count(*) as importCount\n';
    cypherScript += 'ORDER BY importCount DESC;\n\n';
    
    await fs.writeFile(path.join(outputDir, 'neo4j-import.cypher'), cypherScript);
    
    // Generate visualization recommendations
    const recommendations = `
# AST Visualization Recommendations

## Neo4j Graph Database

The AST has been exported in a format suitable for import into Neo4j. To visualize and query the AST:

1. Install Neo4j Desktop (https://neo4j.com/download/)
2. Create a new database
3. Install the APOC plugin
4. Copy the \`neo4j-nodes.json\` and \`neo4j-relationships.json\` files to the import directory of your Neo4j database
5. Update the file paths in \`neo4j-import.cypher\` to point to your import directory
6. Run the Cypher script in \`neo4j-import.cypher\` to import the data
7. Use the Neo4j Browser to visualize and query the AST

## Alternative Visualization Options

### 1. AST Explorer (for individual files)

For exploring individual file ASTs:
- Use https://astexplorer.net/ and select TypeScript as the parser
- Paste the content of a file to see its AST

### 2. D3.js Visualization

For a custom web-based visualization:
- Use D3.js to create an interactive force-directed graph
- Convert the \`ast-graph.json\` to a D3-compatible format
- Implement zooming, filtering, and searching capabilities

### 3. Gephi

For offline visualization:
- Use Gephi (https://gephi.org/) to import the graph data
- Apply layout algorithms like ForceAtlas2
- Use node size, color, and labels to represent different aspects of the AST

## For LLM Consumption

For LLM analysis of the AST:

1. **JSON Format**: The \`ast-graph.json\` file contains the complete AST in a structured JSON format that LLMs can process.

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

## Best Practices for Neo4j Schema

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
`;
    
    await fs.writeFile(path.join(outputDir, 'visualization-recommendations.md'), recommendations);
    
    console.log(`
AST generation complete!

Output files saved to: ${outputDir}
- ast-graph.json: Complete AST graph
- neo4j-nodes.json: Nodes for Neo4j import
- neo4j-relationships.json: Relationships for Neo4j import
- neo4j-import.cypher: Cypher script for Neo4j import
- visualization-recommendations.md: Recommendations for visualization

To visualize the AST:
1. Import the data into Neo4j using the provided Cypher script
2. Use Neo4j Browser to explore the graph
3. See visualization-recommendations.md for more options
`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main().catch(console.error);
