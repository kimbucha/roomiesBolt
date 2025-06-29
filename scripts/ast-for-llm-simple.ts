import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';

// Interface for a simplified AST node
interface SimpleAstNode {
  kind: string;
  text?: string;
  name?: string;
  filePath: string;
  fileName: string;
  line: number;
  column: number;
  children?: SimpleAstNode[];
}

// Interface for a file summary
interface FileSummary {
  filePath: string;
  fileName: string;
  imports: string[];
  exports: string[];
  components: ComponentInfo[];
  functions: FunctionInfo[];
  interfaces: TypeInfo[];
  types: TypeInfo[];
  classes: ClassInfo[];
}

// Interface for component information
interface ComponentInfo {
  name: string;
  filePath: string;
  fileName: string;
  line: number;
  column: number;
  props?: string[];
  jsx?: boolean;
}

// Interface for function information
interface FunctionInfo {
  name: string;
  filePath: string;
  fileName: string;
  line: number;
  column: number;
  parameters?: string[];
  returnType?: string;
}

// Interface for type information
interface TypeInfo {
  name: string;
  kind: 'interface' | 'type' | 'class';
  filePath: string;
  fileName: string;
  line: number;
  column: number;
  properties?: string[];
  methods?: string[];
  extends?: string[];
  implements?: string[];
}

// Interface for class information
interface ClassInfo {
  name: string;
  filePath: string;
  fileName: string;
  line: number;
  column: number;
  properties?: string[];
  methods?: string[];
  extends?: string[];
  implements?: string[];
}

// Interface for directory structure
interface DirectoryStructure {
  name: string;
  path: string;
  files: string[];
  subdirectories: DirectoryStructure[];
}

// Interface for codebase summary
interface CodebaseSummary {
  fileCount: number;
  filesByExtension: Record<string, number>;
  directoryCount: number;
  componentCount: number;
  functionCount: number;
  interfaceCount: number;
  typeCount: number;
  classCount: number;
  importRelationships: Record<string, string[]>;
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

// Function to process a TypeScript file
async function processFile(filePath: string): Promise<FileSummary> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      path.basename(filePath),
      fileContent,
      ts.ScriptTarget.Latest,
      true
    );
    
    const summary: FileSummary = {
      filePath,
      fileName: path.basename(filePath),
      imports: [],
      exports: [],
      components: [],
      functions: [],
      interfaces: [],
      types: [],
      classes: []
    };
    
    // Process the source file
    processNode(sourceFile, sourceFile, filePath, summary);
    
    console.log(`Processed: ${filePath}`);
    return summary;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return {
      filePath,
      fileName: path.basename(filePath),
      imports: [],
      exports: [],
      components: [],
      functions: [],
      interfaces: [],
      types: [],
      classes: []
    };
  }
}

// Function to process a TypeScript node
function processNode(
  node: ts.Node, 
  sourceFile: ts.SourceFile, 
  filePath: string,
  summary: FileSummary
): void {
  const fileName = path.basename(filePath);
  const lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const line = lineAndChar.line + 1;
  const column = lineAndChar.character + 1;
  
  // Process imports
  if (ts.isImportDeclaration(node)) {
    if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      summary.imports.push(node.moduleSpecifier.text);
    }
  }
  
  // Process exports
  else if (ts.isExportDeclaration(node)) {
    if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      summary.exports.push(node.moduleSpecifier.text);
    }
  }
  
  // Process functions (potential components)
  else if (ts.isFunctionDeclaration(node) && node.name) {
    const functionName = node.name.text;
    const parameters = node.parameters.map(p => p.name.getText(sourceFile));
    let returnType = node.type ? node.type.getText(sourceFile) : undefined;
    
    // Check if it's likely a React component
    const isComponent = 
      returnType?.includes('JSX.Element') || 
      returnType?.includes('React.') || 
      filePath.endsWith('.tsx') || 
      functionName.match(/^[A-Z][a-zA-Z0-9]*$/);
    
    if (isComponent) {
      summary.components.push({
        name: functionName,
        filePath,
        fileName,
        line,
        column,
        props: parameters,
        jsx: filePath.endsWith('.tsx')
      });
    } else {
      summary.functions.push({
        name: functionName,
        filePath,
        fileName,
        line,
        column,
        parameters,
        returnType
      });
    }
  }
  
  // Process arrow functions assigned to variables (potential components)
  else if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
    const variableName = node.name.text;
    
    if (node.initializer && ts.isArrowFunction(node.initializer)) {
      const arrowFunction = node.initializer;
      const parameters = arrowFunction.parameters.map(p => p.name.getText(sourceFile));
      let returnType = arrowFunction.type ? arrowFunction.type.getText(sourceFile) : undefined;
      
      // Check if it's likely a React component
      const isComponent = 
        returnType?.includes('JSX.Element') || 
        returnType?.includes('React.') || 
        filePath.endsWith('.tsx') || 
        variableName.match(/^[A-Z][a-zA-Z0-9]*$/);
      
      if (isComponent) {
        summary.components.push({
          name: variableName,
          filePath,
          fileName,
          line,
          column,
          props: parameters,
          jsx: filePath.endsWith('.tsx')
        });
      } else {
        summary.functions.push({
          name: variableName,
          filePath,
          fileName,
          line,
          column,
          parameters,
          returnType
        });
      }
    }
  }
  
  // Process interfaces
  else if (ts.isInterfaceDeclaration(node)) {
    const interfaceName = node.name.text;
    const properties: string[] = [];
    const methods: string[] = [];
    const extendsTypes: string[] = [];
    
    // Get extended types
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          for (const type of clause.types) {
            extendsTypes.push(type.getText(sourceFile));
          }
        }
      }
    }
    
    // Get properties and methods
    node.members.forEach(member => {
      if (ts.isPropertySignature(member) && member.name) {
        properties.push(member.name.getText(sourceFile));
      } else if (ts.isMethodSignature(member) && member.name) {
        methods.push(member.name.getText(sourceFile));
      }
    });
    
    summary.interfaces.push({
      name: interfaceName,
      kind: 'interface',
      filePath,
      fileName,
      line,
      column,
      properties,
      methods,
      extends: extendsTypes
    });
  }
  
  // Process type aliases
  else if (ts.isTypeAliasDeclaration(node)) {
    const typeName = node.name.text;
    
    summary.types.push({
      name: typeName,
      kind: 'type',
      filePath,
      fileName,
      line,
      column
    });
  }
  
  // Process classes
  else if (ts.isClassDeclaration(node) && node.name) {
    const className = node.name.text;
    const properties: string[] = [];
    const methods: string[] = [];
    const extendsTypes: string[] = [];
    const implementsTypes: string[] = [];
    
    // Get heritage clauses (extends, implements)
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          for (const type of clause.types) {
            extendsTypes.push(type.getText(sourceFile));
          }
        } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
          for (const type of clause.types) {
            implementsTypes.push(type.getText(sourceFile));
          }
        }
      }
    }
    
    // Get properties and methods
    node.members.forEach(member => {
      if (ts.isPropertyDeclaration(member) && member.name) {
        properties.push(member.name.getText(sourceFile));
      } else if (ts.isMethodDeclaration(member) && member.name) {
        methods.push(member.name.getText(sourceFile));
      }
    });
    
    // Check if it's likely a React component
    const isComponent = 
      extendsTypes.some(type => 
        type.includes('React.Component') || 
        type.includes('Component')
      );
    
    if (isComponent) {
      summary.components.push({
        name: className,
        filePath,
        fileName,
        line,
        column,
        jsx: filePath.endsWith('.tsx')
      });
    }
    
    summary.classes.push({
      name: className,
      filePath,
      fileName,
      line,
      column,
      properties,
      methods,
      extends: extendsTypes,
      implements: implementsTypes
    });
  }
  
  // Process children
  node.forEachChild(child => {
    processNode(child, sourceFile, filePath, summary);
  });
}

// Function to build directory structure
function buildDirectoryStructure(rootDir: string, fileSummaries: FileSummary[]): DirectoryStructure {
  const structure: DirectoryStructure = {
    name: path.basename(rootDir),
    path: rootDir,
    files: [],
    subdirectories: []
  };
  
  // Group files by directory
  const filesByDir: Record<string, string[]> = {};
  
  fileSummaries.forEach(summary => {
    const dirPath = path.dirname(summary.filePath);
    if (!filesByDir[dirPath]) {
      filesByDir[dirPath] = [];
    }
    filesByDir[dirPath].push(summary.fileName);
  });
  
  // Build directory tree
  function addDirectory(dir: string, parent: DirectoryStructure) {
    const relativePath = path.relative(parent.path, dir);
    const parts = relativePath.split(path.sep);
    
    if (parts.length === 1 && parts[0] !== '') {
      // Direct subdirectory
      const subdir: DirectoryStructure = {
        name: parts[0],
        path: dir,
        files: filesByDir[dir] || [],
        subdirectories: []
      };
      parent.subdirectories.push(subdir);
      
      // Add subdirectories
      Object.keys(filesByDir)
        .filter(d => d.startsWith(dir + path.sep))
        .forEach(d => {
          if (path.dirname(d) === dir) {
            addDirectory(d, subdir);
          }
        });
    }
  }
  
  // Add root files
  structure.files = filesByDir[rootDir] || [];
  
  // Add subdirectories
  Object.keys(filesByDir)
    .filter(dir => dir !== rootDir)
    .forEach(dir => {
      if (path.dirname(dir) === rootDir) {
        addDirectory(dir, structure);
      }
    });
  
  return structure;
}

// Function to generate codebase summary
function generateCodebaseSummary(fileSummaries: FileSummary[], rootDir: string): CodebaseSummary {
  const filesByExtension: Record<string, number> = {};
  const importRelationships: Record<string, string[]> = {};
  
  let componentCount = 0;
  let functionCount = 0;
  let interfaceCount = 0;
  let typeCount = 0;
  let classCount = 0;
  
  // Count files by extension
  fileSummaries.forEach(summary => {
    const ext = path.extname(summary.fileName);
    filesByExtension[ext] = (filesByExtension[ext] || 0) + 1;
    
    // Count components, functions, etc.
    componentCount += summary.components.length;
    functionCount += summary.functions.length;
    interfaceCount += summary.interfaces.length;
    typeCount += summary.types.length;
    classCount += summary.classes.length;
    
    // Build import relationships
    importRelationships[summary.fileName] = summary.imports;
  });
  
  // Count directories
  const directories = new Set<string>();
  fileSummaries.forEach(summary => {
    let dirPath = path.dirname(summary.filePath);
    while (dirPath !== rootDir && dirPath !== '.') {
      directories.add(dirPath);
      dirPath = path.dirname(dirPath);
    }
  });
  
  return {
    fileCount: fileSummaries.length,
    filesByExtension,
    directoryCount: directories.size + 1, // +1 for root
    componentCount,
    functionCount,
    interfaceCount,
    typeCount,
    classCount,
    importRelationships
  };
}

// Function to generate markdown for components
function generateComponentsMarkdown(fileSummaries: FileSummary[]): string {
  const components: ComponentInfo[] = [];
  
  fileSummaries.forEach(summary => {
    components.push(...summary.components);
  });
  
  // Sort components by name
  components.sort((a, b) => a.name.localeCompare(b.name));
  
  let markdown = '# React Components\n\n';
  
  components.forEach(comp => {
    markdown += `## ${comp.name}\n`;
    markdown += `- **File:** ${comp.fileName}\n`;
    markdown += `- **Path:** ${comp.filePath}\n`;
    markdown += `- **Line:** ${comp.line}\n`;
    
    if (comp.props && comp.props.length > 0) {
      markdown += `- **Props:** ${comp.props.join(', ')}\n`;
    }
    
    markdown += '\n';
  });
  
  return markdown;
}

// Function to generate markdown for types
function generateTypesMarkdown(fileSummaries: FileSummary[]): string {
  const types: TypeInfo[] = [];
  
  fileSummaries.forEach(summary => {
    types.push(...summary.interfaces, ...summary.types);
  });
  
  // Sort types by name
  types.sort((a, b) => a.name.localeCompare(b.name));
  
  let markdown = '# Type Definitions\n\n';
  
  types.forEach(type => {
    markdown += `## ${type.name}\n`;
    markdown += `- **Kind:** ${type.kind}\n`;
    markdown += `- **File:** ${type.fileName}\n`;
    markdown += `- **Path:** ${type.filePath}\n`;
    markdown += `- **Line:** ${type.line}\n`;
    
    if (type.extends && type.extends.length > 0) {
      markdown += `- **Extends:** ${type.extends.join(', ')}\n`;
    }
    
    if (type.implements && type.implements.length > 0) {
      markdown += `- **Implements:** ${type.implements.join(', ')}\n`;
    }
    
    if (type.properties && type.properties.length > 0) {
      markdown += `- **Properties:** ${type.properties.join(', ')}\n`;
    }
    
    if (type.methods && type.methods.length > 0) {
      markdown += `- **Methods:** ${type.methods.join(', ')}\n`;
    }
    
    markdown += '\n';
  });
  
  return markdown;
}

// Function to generate markdown for imports
function generateImportsMarkdown(fileSummaries: FileSummary[]): string {
  const importsByFile: Record<string, string[]> = {};
  
  fileSummaries.forEach(summary => {
    if (summary.imports.length > 0) {
      importsByFile[summary.fileName] = summary.imports;
    }
  });
  
  let markdown = '# Import Relationships\n\n';
  
  Object.entries(importsByFile)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([file, imports]) => {
      markdown += `## ${file}\n`;
      imports.forEach(imp => {
        markdown += `- Imports \`${imp}\`\n`;
      });
      markdown += '\n';
    });
  
  return markdown;
}

// Function to generate markdown for directory structure
function generateDirectoryMarkdown(structure: DirectoryStructure, level: number = 0): string {
  const indent = '  '.repeat(level);
  let markdown = '';
  
  if (level === 0) {
    markdown += '# Directory Structure\n\n';
    markdown += '```\n';
  }
  
  markdown += `${indent}${structure.name}/\n`;
  
  // Add files
  structure.files.sort().forEach(file => {
    markdown += `${indent}  ${file}\n`;
  });
  
  // Add subdirectories
  structure.subdirectories
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(subdir => {
      markdown += generateDirectoryMarkdown(subdir, level + 1);
    });
  
  if (level === 0) {
    markdown += '```\n';
  }
  
  return markdown;
}

// Function to generate markdown for codebase summary
function generateSummaryMarkdown(summary: CodebaseSummary): string {
  let markdown = '# Codebase Summary\n\n';
  
  markdown += '## File Statistics\n';
  markdown += `- Total Files: ${summary.fileCount}\n`;
  
  markdown += '\n### Files by Extension\n';
  Object.entries(summary.filesByExtension)
    .sort(([, a], [, b]) => b - a)
    .forEach(([ext, count]) => {
      markdown += `- ${ext}: ${count} files\n`;
    });
  
  markdown += '\n## Directory Statistics\n';
  markdown += `- Total Directories: ${summary.directoryCount}\n`;
  
  markdown += '\n## Code Statistics\n';
  markdown += `- Components: ${summary.componentCount}\n`;
  markdown += `- Functions: ${summary.functionCount}\n`;
  markdown += `- Interfaces: ${summary.interfaceCount}\n`;
  markdown += `- Type Aliases: ${summary.typeCount}\n`;
  markdown += `- Classes: ${summary.classCount}\n`;
  
  return markdown;
}

// Main function
async function main() {
  try {
    const rootDir = process.cwd();
    const outputDir = path.join(rootDir, 'ast-output-llm');
    
    // Create output directory if it doesn't exist
    await fs.ensureDir(outputDir);
    
    // Find all TypeScript files
    console.log('Finding TypeScript files...');
    const files = await findTypeScriptFiles(rootDir);
    console.log(`Found ${files.length} TypeScript files.`);
    
    // Process each file
    console.log('Processing files...');
    const fileSummaries: FileSummary[] = [];
    
    for (const file of files) {
      const summary = await processFile(file);
      fileSummaries.push(summary);
    }
    
    // Build directory structure
    console.log('Building directory structure...');
    const directoryStructure = buildDirectoryStructure(rootDir, fileSummaries);
    
    // Generate codebase summary
    console.log('Generating codebase summary...');
    const codebaseSummary = generateCodebaseSummary(fileSummaries, rootDir);
    
    // Generate markdown files
    console.log('Generating markdown files...');
    
    // Summary
    const summaryMarkdown = generateSummaryMarkdown(codebaseSummary);
    await fs.writeFile(path.join(outputDir, 'codebase-summary.md'), summaryMarkdown);
    
    // Components
    const componentsMarkdown = generateComponentsMarkdown(fileSummaries);
    await fs.writeFile(path.join(outputDir, 'components.md'), componentsMarkdown);
    
    // Types
    const typesMarkdown = generateTypesMarkdown(fileSummaries);
    await fs.writeFile(path.join(outputDir, 'types.md'), typesMarkdown);
    
    // Imports
    const importsMarkdown = generateImportsMarkdown(fileSummaries);
    await fs.writeFile(path.join(outputDir, 'imports.md'), importsMarkdown);
    
    // Directory structure
    const directoryMarkdown = generateDirectoryMarkdown(directoryStructure);
    await fs.writeFile(path.join(outputDir, 'directory-structure.md'), directoryMarkdown);
    
    // Save raw data for potential further processing
    await fs.writeJson(path.join(outputDir, 'file-summaries.json'), fileSummaries, { spaces: 2 });
    
    console.log(`
AST analysis complete!

Output files saved to: ${outputDir}
- codebase-summary.md: Summary of the codebase structure
- components.md: List of React components
- types.md: List of type definitions
- imports.md: Import relationships
- directory-structure.md: Directory structure
- file-summaries.json: Raw data for further processing

These files are formatted specifically for LLM consumption.
`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main().catch(console.error);
