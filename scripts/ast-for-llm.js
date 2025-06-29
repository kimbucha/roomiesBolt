#!/usr/bin/env node

/**
 * This script demonstrates how to extract information from the AST
 * and format it in a way that's suitable for LLM consumption.
 * 
 * Usage: node scripts/ast-for-llm.js [query-type]
 * 
 * Query types:
 *   - summary: Generate a summary of the codebase structure
 *   - components: List all React components
 *   - imports: Show import relationships
 *   - types: List all type definitions
 */

const fs = require('fs');
const path = require('path');

// Check if the AST data exists
const astOutputDir = path.join(__dirname, '..', 'ast-output');
const astGraphFile = path.join(astOutputDir, 'ast-graph.json');

if (!fs.existsSync(astGraphFile)) {
  console.error('AST data not found. Please run ./scripts/generate-ast.sh first.');
  process.exit(1);
}

// Load the AST data
console.log('Loading AST data...');
const astGraph = JSON.parse(fs.readFileSync(astGraphFile, 'utf8'));
console.log(`Loaded ${astGraph.nodes.length} nodes and ${astGraph.relationships.length} relationships.`);

// Get the query type from command line arguments
const queryType = process.argv[2] || 'summary';

// Process the query
switch (queryType) {
  case 'summary':
    generateSummary(astGraph);
    break;
  case 'components':
    listComponents(astGraph);
    break;
  case 'imports':
    showImports(astGraph);
    break;
  case 'types':
    listTypes(astGraph);
    break;
  default:
    console.error(`Unknown query type: ${queryType}`);
    console.error('Available query types: summary, components, imports, types');
    process.exit(1);
}

/**
 * Generate a summary of the codebase structure
 */
function generateSummary(astGraph) {
  console.log('\n=== CODEBASE SUMMARY ===\n');
  
  // Count files by extension
  const fileNodes = astGraph.nodes.filter(node => node.labels.includes('File'));
  const filesByExtension = {};
  
  fileNodes.forEach(node => {
    const extension = node.properties.extension;
    filesByExtension[extension] = (filesByExtension[extension] || 0) + 1;
  });
  
  console.log('Files by extension:');
  Object.entries(filesByExtension)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      console.log(`  ${ext}: ${count} files`);
    });
  
  // Count directories
  const directoryNodes = astGraph.nodes.filter(node => node.labels.includes('Directory'));
  console.log(`\nTotal directories: ${directoryNodes.length}`);
  
  // Count node types
  const nodeTypes = {};
  astGraph.nodes.forEach(node => {
    node.labels.forEach(label => {
      if (label !== 'File' && label !== 'Directory') {
        nodeTypes[label] = (nodeTypes[label] || 0) + 1;
      }
    });
  });
  
  console.log('\nAST node types:');
  Object.entries(nodeTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} nodes`);
    });
  
  // Count relationship types
  const relationshipTypes = {};
  astGraph.relationships.forEach(rel => {
    relationshipTypes[rel.type] = (relationshipTypes[rel.type] || 0) + 1;
  });
  
  console.log('\nRelationship types:');
  Object.entries(relationshipTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} relationships`);
    });
  
  // Generate a markdown summary for LLM consumption
  const summaryForLLM = `
# Codebase Summary

## File Statistics
${Object.entries(filesByExtension)
  .sort((a, b) => b[1] - a[1])
  .map(([ext, count]) => `- ${ext}: ${count} files`)
  .join('\n')}

## Directory Structure
- Total directories: ${directoryNodes.length}

## AST Node Types (Top 20)
${Object.entries(nodeTypes)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([type, count]) => `- ${type}: ${count} nodes`)
  .join('\n')}

## Relationship Types
${Object.entries(relationshipTypes)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- ${type}: ${count} relationships`)
  .join('\n')}
`;
  
  fs.writeFileSync(path.join(astOutputDir, 'codebase-summary.md'), summaryForLLM);
  console.log('\nSummary saved to ast-output/codebase-summary.md');
}

/**
 * List all React components in the codebase
 */
function listComponents(astGraph) {
  console.log('\n=== REACT COMPONENTS ===\n');
  
  // Find all function declarations and arrow functions in TSX files
  const tsxFileNodes = astGraph.nodes.filter(node => 
    node.labels.includes('File') && 
    node.properties.fileName.endsWith('.tsx')
  );
  
  const components = [];
  
  // For each TSX file
  tsxFileNodes.forEach(fileNode => {
    const fileName = fileNode.properties.fileName;
    const filePath = fileNode.properties.filePath;
    
    // Find all function declarations in this file
    const functionNodes = astGraph.nodes.filter(node => {
      // Check if this node is a child of the file node
      const isChildOfFile = astGraph.relationships.some(rel => 
        rel.type === 'CHILD_OF' && 
        rel.startNode === node.id && 
        rel.endNode === fileNode.id
      );
      
      // Check if this node is a function declaration or arrow function
      const isFunction = 
        (node.labels.includes('FunctionDeclaration') && node.properties.functionName) ||
        (node.labels.includes('ArrowFunction') && node.properties.variableName);
      
      return isChildOfFile && isFunction;
    });
    
    // Add components to the list
    functionNodes.forEach(funcNode => {
      const componentName = funcNode.properties.functionName || funcNode.properties.variableName;
      if (componentName) {
        components.push({
          name: componentName,
          fileName,
          filePath,
          nodeType: funcNode.labels[0]
        });
      }
    });
  });
  
  // Sort components by name
  components.sort((a, b) => a.name.localeCompare(b.name));
  
  // Print components
  components.forEach(comp => {
    console.log(`${comp.name} (${comp.nodeType})`);
    console.log(`  File: ${comp.fileName}`);
    console.log(`  Path: ${comp.filePath}`);
    console.log('');
  });
  
  // Generate a markdown list for LLM consumption
  const componentsForLLM = `
# React Components

${components.map(comp => `
## ${comp.name}
- **Type:** ${comp.nodeType}
- **File:** ${comp.fileName}
- **Path:** ${comp.filePath}
`).join('\n')}
`;
  
  fs.writeFileSync(path.join(astOutputDir, 'react-components.md'), componentsForLLM);
  console.log(`Found ${components.length} components. List saved to ast-output/react-components.md`);
}

/**
 * Show import relationships between files
 */
function showImports(astGraph) {
  console.log('\n=== IMPORT RELATIONSHIPS ===\n');
  
  // Find all import relationships
  const importRels = astGraph.relationships.filter(rel => rel.type === 'IMPORTS');
  
  // Group imports by source file
  const importsByFile = {};
  
  importRels.forEach(rel => {
    // Find the import node
    const importNode = astGraph.nodes.find(node => node.id === rel.startNode);
    if (!importNode) return;
    
    // Find the file that contains this import
    const fileRel = astGraph.relationships.find(r => 
      r.type === 'CHILD_OF' && 
      r.startNode === importNode.id
    );
    if (!fileRel) return;
    
    const sourceFileNode = astGraph.nodes.find(node => 
      node.labels.includes('File') && 
      node.id === fileRel.endNode
    );
    if (!sourceFileNode) return;
    
    // Find the target file
    const targetFileNode = astGraph.nodes.find(node => 
      node.labels.includes('File') && 
      node.id === rel.endNode
    );
    if (!targetFileNode) return;
    
    // Add to imports by file
    const sourceFile = sourceFileNode.properties.fileName;
    const targetFile = targetFileNode.properties.fileName;
    const moduleSpecifier = importNode.properties.moduleSpecifier;
    
    if (!importsByFile[sourceFile]) {
      importsByFile[sourceFile] = [];
    }
    
    importsByFile[sourceFile].push({
      targetFile,
      moduleSpecifier
    });
  });
  
  // Print imports by file
  Object.entries(importsByFile).forEach(([sourceFile, imports]) => {
    console.log(`${sourceFile} imports:`);
    imports.forEach(imp => {
      console.log(`  ${imp.moduleSpecifier} -> ${imp.targetFile}`);
    });
    console.log('');
  });
  
  // Generate a markdown list for LLM consumption
  const importsForLLM = `
# Import Relationships

${Object.entries(importsByFile).map(([sourceFile, imports]) => `
## ${sourceFile}
${imports.map(imp => `- Imports \`${imp.moduleSpecifier}\` from \`${imp.targetFile}\``).join('\n')}
`).join('\n')}
`;
  
  fs.writeFileSync(path.join(astOutputDir, 'import-relationships.md'), importsForLLM);
  console.log(`Found imports in ${Object.keys(importsByFile).length} files. List saved to ast-output/import-relationships.md`);
}

/**
 * List all type definitions in the codebase
 */
function listTypes(astGraph) {
  console.log('\n=== TYPE DEFINITIONS ===\n');
  
  // Find all interface and type alias declarations
  const typeNodes = astGraph.nodes.filter(node => 
    node.labels.includes('Interface') || 
    node.labels.includes('TypeAlias')
  );
  
  const types = [];
  
  // For each type node
  typeNodes.forEach(typeNode => {
    // Find the file that contains this type
    const fileRel = astGraph.relationships.find(rel => 
      rel.type === 'CHILD_OF' && 
      rel.startNode === typeNode.id
    );
    if (!fileRel) return;
    
    const fileNode = astGraph.nodes.find(node => 
      node.labels.includes('File') && 
      node.id === fileRel.endNode
    );
    if (!fileNode) return;
    
    // Add to types list
    types.push({
      name: typeNode.properties.interfaceName || typeNode.properties.typeName,
      kind: typeNode.labels.includes('Interface') ? 'Interface' : 'Type Alias',
      fileName: fileNode.properties.fileName,
      filePath: fileNode.properties.filePath,
      text: typeNode.properties.text
    });
  });
  
  // Sort types by name
  types.sort((a, b) => a.name.localeCompare(b.name));
  
  // Print types
  types.forEach(type => {
    console.log(`${type.name} (${type.kind})`);
    console.log(`  File: ${type.fileName}`);
    console.log(`  Path: ${type.filePath}`);
    console.log('');
  });
  
  // Generate a markdown list for LLM consumption
  const typesForLLM = `
# Type Definitions

${types.map(type => `
## ${type.name}
- **Kind:** ${type.kind}
- **File:** ${type.fileName}
- **Path:** ${type.filePath}

\`\`\`typescript
${type.text}
\`\`\`
`).join('\n')}
`;
  
  fs.writeFileSync(path.join(astOutputDir, 'type-definitions.md'), typesForLLM);
  console.log(`Found ${types.length} type definitions. List saved to ast-output/type-definitions.md`);
}
