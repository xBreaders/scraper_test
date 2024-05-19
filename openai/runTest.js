import fs from "fs";
import {TestFile} from "../gemini/entities/errorPrompt.js";
import {generateContent} from "./init.js";


const functionsWithErrors = fs.readFileSync('../file_content_and_errors.json', 'utf-8');

const functions = JSON.parse(functionsWithErrors);

const testFiles = Object.entries(functions).map(([key, value]) => {
    return new TestFile(value.fileContents, value.errors, value.testFilePath);
});

generateContent(testFiles).then(r => console.log(r));

