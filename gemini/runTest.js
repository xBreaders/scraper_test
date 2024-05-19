import fs from "fs";
import {TestFile} from "./entities/errorPrompt.js";
import {fixTests, generateContent} from "./init.js";


const functionsWithErrors = fs.readFileSync('../file_content_and_errors.json', 'utf-8');

const functions = JSON.parse(functionsWithErrors);


const testFiles = Object.entries(functions).map(([key, value]) => {
    return new TestFile(value.fileContents, value.errors, value.testFilePath);
});


fixTests(testFiles).then(r => console.log(r));