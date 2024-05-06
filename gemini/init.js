import {VertexAI} from '@google-cloud/vertexai';
import {Entity, Prompt} from "./entities/response_entity.js";
import fs from "fs";
import path from "path";
import {Parser as acorn} from "acorn";
import {generate} from "astring";


function bigToString(obj) {
    // Check if the input is an object
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Input must be an object');
    }

    // Stringify the object properties recursively
    function stringifyProperties(obj) {
        let result = '';
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                result += `"${key}": `;
                if (typeof value === 'object' && value !== null) {
                    result += `{${stringifyProperties(value)}}`;
                } else if (typeof value === 'string') {
                    result += `"${value}"`;
                } else {
                    result += `${value}`;
                }
                result += ',';
            }
        }
        // Remove the trailing comma
        return result.slice(0, -1);
    }

    // Start with an opening curly brace
    let str = '{';

    // Stringify the "prompt" property
    str += '"prompt": {';
    str += stringifyProperties(obj.prompt);
    str += '}';

    // Close the curly brace
    str += '}';

    return str;
}

function preparePrompts(){
    const data = fs.readFileSync('./scraper_output/functions_with_snippets.json', 'utf-8');
// Parse the JSON string into JavaScript objects
    const functions = JSON.parse(data);

// Get the first 5 entries
    const firstFiveFunctions = Object.entries(functions).slice(0, 10);

// Create Prompt objects from the first 5 entries
    return firstFiveFunctions.map(([key, value]) => {
        const prompt = new Prompt();
        prompt.setTaskDescription(`Task Description:
You are tasked with generating unit tests for a function called ${key}.
 The goal is to ensure that the function behaves as expected under various conditions. Write very simple unit tests that can easily pass without any need of manual correction. Include any functions that are used in the written tests and if you know the file location, the only dependency you can use is Jest and do not import any other dependencies other than the given filePath. return RAW OUTPUT without any backticks or code formatting`);
        prompt.setCodeSnippet(value.body);
        prompt.setFunctionDeclaration(value.functionDeclaration);
        prompt.setFunctionDescription(value.params || "N/A");
        prompt.setFilePath(value.filePath);
        prompt.setDeclarationsOutsideOfFunction(value.usedDeclarations);
        return prompt;
    });
}


async function createNonStreamingMultipartContent(
) {
    // Initialize Vertex with your Cloud project and location
    const vertex_ai = new VertexAI({project: 'inspired-nomad-422117-j3', location: 'europe-west1'});
    const exampleData = fs.readFileSync('./scraper_output/examples.json', 'utf-8');

    const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: 'gemini-1.5-pro-preview-0409',
    });

    for (const prompt of preparePrompts()) {
        const request = {
            prompt: prompt.getPrompt(),
        };
        const result = await generativeModel.generateContent(exampleData + bigToString(request) );
        const entity = new Entity(result.response.candidates, result.response.usageMetadata);
        const functionName = prompt.getPrompt().taskDescription.match(/function called (\w+)/)[1];
        console.log(entity.candidates[0].content.parts[0].text)
        const parsedContent = acorn.parse(entity.candidates[0].content.parts[0].text, {allowReturnOutsideFunction: true, })
        const code = generate(parsedContent);

        const filePath = path.join('output', `${functionName}.test.js`).replace(/\\/g, '/');
        fs.writeFileSync(filePath, code);
    }

}

createNonStreamingMultipartContent().then(r => console.log(r)).catch(e => console.error(e));


