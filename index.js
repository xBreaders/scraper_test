import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import { parse as parseDoctrine } from 'doctrine'; // For parsing JSDoc comments
import { walk } from 'estree-walker'; // For traversing AST
import {parse as parseAcorn} from 'acorn'; // For parsing JavaScript code
import { generate } from 'astring'; // For generating JavaScript code


class DocumentationMiner {
    constructor(packagePath) {
        this.packagePath = packagePath;
        this.docs = {};
        this.md = new MarkdownIt();
    }

    extractDocumentation() {
        const markdownFiles = this.findAllMarkdownFiles(this.packagePath);
        for (const file of markdownFiles) {
            this.extractFromFile(file);
        }
        return this.docs;
    }

    // Recursively find all Markdown files within the package directory
    findAllMarkdownFiles(dirPath) {
        const files = [];
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory() && itemPath !== dirPath) {
                files.push(...this.findAllMarkdownFiles(itemPath));
            } else if (path.extname(itemPath) === '.md') {
                files.push(itemPath);
            }
        }

        return files;
    }

    extractFromFile(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const tokens = this.md.parse(fileContent, {});
        let currentFunction = null;
        let previousToken = null;

        for (const token of tokens) {
            if (token.type === 'heading_open' && token.tag === 'h2') {
                previousToken = token;
            } else if (token.type === 'inline' && previousToken && previousToken.type === 'heading_open') {
                if (!currentFunction || token.content.length < currentFunction.length) {
                    currentFunction = token.content;
                    this.docs[currentFunction] = { snippets: [], comments: [] };
                } else {
                    this.docs[currentFunction].comments.push(token.content);
                }
                previousToken = null;
            } else if (token.type === 'fence' && currentFunction) {
                this.docs[currentFunction].snippets.push(token.content);
            } else if (token.type === 'paragraph_open' && currentFunction && token.children != null) {
                const paragraphContent = token.children[0].content;
                if (paragraphContent.startsWith('/**') && paragraphContent.endsWith('*/')) {
                    // Parse JSDoc comments with doctrine for better structure
                    const jsdocAST = parseDoctrine(paragraphContent);
                    this.docs[currentFunction].comments.push(jsdocAST);
                }
            }
        }
    }
}

class FunctionMiner {
    constructor(packagePath) {
        this.packagePath = packagePath;
        this.minedFunctions = {};
    }

    async extractFunctions() {
        // Find all JavaScript files within the package directory
        const jsFiles = this.findAllJSFiles(this.packagePath);

        for (const file of jsFiles) {
            await this.extractFromFile(file);
        }

        return this.minedFunctions;
    }

    findAllJSFiles(dirPath) {
        const files = [];
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                if (item !== 'node_modules') { // Exclude the node_modules directory
                    files.push(...this.findAllJSFiles(itemPath));
                }
            } else if (path.extname(itemPath) === '.js' && (itemPath.includes('\\test\\') === false && itemPath.includes('benchmark') === false && itemPath.includes('examples') === false && itemPath.includes("coverage") === false)) {
                files.push(itemPath);
            }
        }

        return files;
    }

    async extractFromFile(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const ast = this.parseJS(fileContent);

        const declarations = new Map();

        walk(ast, {
            enter: (node, parent) => {
                if (node.type === 'VariableDeclaration') {
                    for (const declaration of node.declarations) {
                        if (declaration.id.type === 'Identifier') {
                            declarations.set(declaration.id.name, generate(declaration));
                        }
                    }
                } else if (node.type === 'ImportDeclaration') {
                    declarations.set(node.source.value, generate(node));
                } else if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
                    const functionName = node.id ? node.id.name : '(anonymous)';
                    const params = node.params.map(p => p.name);
                    let functionBody = null;
                    if (node.body.type === 'BlockStatement') {
                        functionBody = generate(node.body);
                    } else if (node.body.type === 'ArrowFunctionExpression') {
                        functionBody = generate(node.body);
                    }

                    // Create a new node for the function declaration
                    const functionDeclarationNode = {
                        type: node.type,
                        id: node.id,
                        params: node.params,
                        body: {
                            type: 'BlockStatement',
                            body: [],
                        },
                    };

                    // Generate the function declaration
                    const functionDeclaration = generate(functionDeclarationNode);

                    // Find used declarations
                    const usedDeclarations = new Map();
                    walk(node, {
                        enter: (node) => {
                            if (node.type === 'Identifier' && declarations.has(node.name)) {
                                usedDeclarations.set(node.name, declarations.get(node.name));
                            }
                        },
                    });

                    this.minedFunctions[functionName] = {
                        params,
                        body: functionBody,
                        functionDeclaration, // Add the function declaration here
                        filePath,
                        usedDeclarations: Array.from(usedDeclarations.values()),
                    };
                }
            },
        });
    }

    parseJS(code) {
        // Use a JavaScript parser like @babel/parser or acorn here
        // Example using @babel/parser:

         return parseAcorn(code, { allowReturnOutsideFunction : true });
    }
}

// Example usage
const packagePath = 'test_base/bluebird';
const docMiner = new DocumentationMiner(packagePath);
const docs = await docMiner.extractDocumentation();
const functionMiner = new FunctionMiner(packagePath);
const functions = await functionMiner.extractFunctions();

// Combine information from both miners
for (const docKey in docs) {
    for (const functionKey in functions) {
        if (docKey.includes(functionKey)) {
            functions[functionKey].snippets = docs[docKey].snippets;
            functions[functionKey].comments = docs[docKey].comments;
        }
    }
}
console.log(functions);
console.log(docs)

//write the ones that have snippets in them to a json file
let functionsWithSnippets = {};
for (const functionKey in functions) {
    if (functions[functionKey].snippets != null) {
        functionsWithSnippets[functionKey] = functions[functionKey];
    }
}

fs.writeFileSync('scraper_output/functions_with_snippets.json', JSON.stringify(functionsWithSnippets, null, 2));
