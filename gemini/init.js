import {VertexAI} from '@google-cloud/vertexai';
import {Entity, Prompt} from './entities/response_entity.js';
import fs from 'fs';
import path from 'path';
import {Parser as acorn} from 'acorn';
import {generate} from 'astring';
import {sleep} from "openai/core";

const PROJECT_ID = 'inspired-nomad-422117-j3';
const LOCATION = 'us-central1';
const MODEL_NAME = 'gemini-1.5-flash-preview-0514';

const vertexAI = new VertexAI({project: PROJECT_ID, location: LOCATION});
const generativeModel = vertexAI.preview.getGenerativeModel({
    model: MODEL_NAME,

});

// Function to parse JSON data and create Prompt objects
function preparePrompts() {
    const data = fs.readFileSync('../scraper_output/functions_with_snippets.json', 'utf-8');
    const functions = JSON.parse(data)
    return Object.entries(functions).map(([key, value]) => {
        const prompt = new Prompt();
        prompt.setTaskDescription(`Task Description:
You are tasked with generating unit tests for a function called ${key.split("\\").pop()}.
You are a QA Engineer at a software company: You are tasked to generate unit tests for Javascript projects. The unit tests have to be SIMPLE WITHOUT ANY ERRORS and with EVERYTHING DECLARED CORRECTLY, The package is called fs-extra. Use Jest as testing framework and try to achieve maximum coverage. NO CODE FORMATTING`);
        prompt.setCodeSnippet(value.fileContent);
        prompt.setFilePath(value.filePath);
        return prompt;
    });
}

// Function to generate content using Vertex AI Generative Model
export async function generateContent(input) {
    fs.readFileSync('../scraper_output/examples.json', 'utf-8');
    for (const prompt of input) {
        const request = {
            prompt: prompt.getPrompt(),
        };
        console.log(JSON.stringify(request));
        await sleep(7500);

        const result = await generativeModel.generateContent(JSON.stringify(request),
            {
                temperature: 0.1,
            });
        const entity = new Entity(result.response.candidates, result.response.usageMetadata);
        const functionName = prompt.getPrompt().taskDescription.match(/function called (\w+)/)[1];
        console.log(entity.candidates[0].content.parts[0].text);
        try {
            const parsedContent = acorn.parse(entity.candidates[0].content.parts[0].text, {
                allowReturnOutsideFunction: true,
                sourceType: 'module',
            });
            const code = generate(parsedContent);
            const filePath = path.join('output', `${functionName}.gemini.test.js`).replace(/\\/g, '/');
            fs.writeFileSync(filePath, code);
        } catch (e) {
            console.log(e);
        }
    }
}

export async function fixTests(testArray) {
    for (const testFile of testArray) {
        const {fileContents, errors} = testFile;

        const request = {
            prompt: {
                taskDescription: 'You are a Unit test expert and are given the task to fix the given unit test, so that all tests pass in the unit test pass, you are given the errors for each of these tests as extra information. Make sure everything is defined and working while maintaining maximum coverage. Output has to be RAW code without any backticks or formatting.  You are tasked with fixing the following unit test: (NO FORMATTING)',
                fileContents,
                errors,
            },
        };
        await sleep(7500);
        console.log(JSON.stringify(request));
        const result = await generativeModel.generateContent(JSON.stringify(request),
            {
                temperature: 0.1,
            });
        const entity = new Entity(result.response.candidates, result.response.usageMetadata);

        // Extract the directory, filename, and extension
        const dirName = path.dirname(testFile.filePath);
        const extName = path.extname(testFile.filePath);
        const baseName = path.basename(testFile.filePath, extName);

        const newBaseName = `${baseName}${extName}`;

        const newTestFilePath = path.join(dirName, newBaseName);

        try {

            const parsedContent = acorn.parse(entity.candidates[0].content.parts[0].text, {
                allowReturnOutsideFunction: true,
                sourceType: 'module',
            });

            const code = generate(parsedContent);

            fs.writeFileSync(newTestFilePath, code);

            console.log(entity.candidates[0].content.parts[0].text);
        } catch (e) {
            console.log(e);
        }
    }
}

generateContent(preparePrompts()).then(r => console.log(r));