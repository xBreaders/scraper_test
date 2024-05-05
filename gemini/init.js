import {VertexAI} from '@google-cloud/vertexai';
import {Entity, Prompt} from "./entities/response_entity.js";
import fs from "fs";




function preparePrompts(){
    const data = fs.readFileSync('../functions_with_snippets.json', 'utf-8');

// Parse the JSON string into JavaScript objects
    const functions = JSON.parse(data);

// Get the first 5 entries
    const firstFiveFunctions = Object.entries(functions).slice(0, 5);

// Create Prompt objects from the first 5 entries
    return firstFiveFunctions.map(([key, value]) => {
        const prompt = new Prompt();
        prompt.setTaskDescription(`Task Description:
You are tasked with generating unit tests for a function called ${key}.
 The goal is to ensure that the function behaves as expected under various conditions. Write very simple unit tests that can easily pass without any need of manual correction. Include any functions that need to be included, the only dependency you can use is mocha and do not import any other dependencies`);
        prompt.setCodeSnippet(value.body);
        prompt.setFunctionDescription(`Parameters: ${value.params.join(', ')}`);
        return prompt;
    });
}


async function createNonStreamingMultipartContent(
) {
    // Initialize Vertex with your Cloud project and location
    const vertex_ai = new VertexAI({project: 'inspired-nomad-422117-j3', location: 'europe-west1'});

    const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: 'gemini-1.5-pro-preview-0409',
    });

    for (const prompt of preparePrompts()) {
        const request = {
            prompt: prompt.getPrompt(),
        };
        const result = await generativeModel.generateContent(request);
        const entity = new Entity(result.response.candidates, result.response.usageMetadata);
        console.log('Response: ', entity.candidates.forEach(candidate => console.log(candidate.content.parts[0].text)));
    }


    // For images, the SDK supports both Google Cloud Storage URI and base64 strings
    async function generateContent() {
        const request = {
            contents: [{role: 'user', parts: [{text: 'How are you doing today?'}]}],
        };
        const result = await generativeModel.generateContent(request);
        //json response

    }

    await generateContent();
}

createNonStreamingMultipartContent().then(r => console.log(r)).catch(e => console.error(e));


