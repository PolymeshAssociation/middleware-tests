import { writeFileSync } from 'fs';
import * as path from 'path';
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
  skipAddingFilesFromTsConfig: true,
});
const assertImportSpecifier = 'assert';

const outputPath = './examples';

const excludePaths = ['settlements/util.ts'];

project.addSourceFilesAtPaths('./src/sdk/**/*.ts');

// Get all the source files
const sourceFiles = project.getSourceFiles();
// Loop through all the files
sourceFiles.forEach((sourceFile) => {
  // Determine the path of the new file based on the path of the source file
  const relativePath = path.relative(path.resolve('src/sdk'), sourceFile.getFilePath());

  if (excludePaths.includes(relativePath)) {
    return;
  }

  const newPath = path.resolve(outputPath, relativePath);

  // Create a new source file for the example
  const newFile = project.createSourceFile(newPath, sourceFile.getFullText(), { overwrite: true });

  // Remove import declaration of 'assert'
  newFile.getImportDeclarations().forEach((importDeclaration) => {
    if (importDeclaration.getModuleSpecifierValue() === assertImportSpecifier) {
      importDeclaration.remove();
    }
  });

  // Find all CallExpressions
  const callExpressions = newFile.getDescendantsOfKind(SyntaxKind.CallExpression);

  // Filter out the assert calls
  const assertCalls = callExpressions.filter((call) => {
    const expression = call.getExpression();

    return (
      expression.getKind() === SyntaxKind.Identifier &&
      expression.getText() === assertImportSpecifier
    );
  });

  // Remove assert calls as they clutter the examples
  assertCalls.forEach((assertCall) => {
    const parentStatement = assertCall.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);
    if (parentStatement) {
      parentStatement.remove();
    }
  });

  // Organize imports and format the new file before saving
  newFile.organizeImports();
  newFile.formatText();
});

// Save changes to disk
project.save();

// Write a file that will allow for config
const configPath = path.join(outputPath, 'config.ts');

const exampleConfig = `export const config = {
  nodeUrl: process.env.NODE_URL || 'ws://localhost:9944',
  graphqlUrl: process.env.GRAPHQL_URL || 'http://localhost:3001',
};`;

export const config = {
  nodeUrl: process.env.NODE_URL || 'ws://localhost:9944',
  graphqlUrl: process.env.GRAPHQL_URL || 'http://localhost:3001',
};

writeFileSync(configPath, exampleConfig);
