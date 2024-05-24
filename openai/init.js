import OpenAI from "openai";
import fs from "fs";
import {Prompt} from "../gemini/entities/response_entity.js";
import path from "path";
import {TestFile} from "../gemini/entities/errorPrompt.js";
import {sleep} from "openai/core";

const openai = new OpenAI({
    apiKey: "sk-proj-FnRfVQqOFtkYvufQg5WVT3BlbkFJi5MVtHaGGymW4WIuQNSQ",
});


function preparePrompts() {
    const data = fs.readFileSync('../scraper_output/functions_with_snippets.json', 'utf-8');
    const functions = JSON.parse(data)
    return Object.entries(functions).slice(15).map(([key, value]) => {
        const prompt = new Prompt();
        prompt.setTaskDescription(`Task Description:
You are tasked with generating unit tests for a function called ${key.split("\\").pop()}.
You are a QA Engineer at a software company: You are tasked to generate unit tests for Javascript projects. The unit tests have to be SIMPLE WITHOUT ANY ERRORS and with EVERYTHING DECLARED CORRECTLY, The package is called fs-extra. use Jest as testing framework and try to achieve maximum coverage. NO CODE FORMATTING`);
        prompt.setCodeSnippet(value.fileContent);
        prompt.setFilePath(value.filePath);
        return prompt;
    });
}

export async function generateContent(input
) {

    if (input[0] instanceof TestFile) {
        for (const testFile of input) {
            const {fileContents, errors} = testFile;
            const request = {
                prompt: {
                    taskDescription: "Fix the following unit test for package Glob",
                    fileContents,
                    errors
                }
            };
            await sleep(10000);
            const response = await openai.chat.completions.create({
                model: "gpt-4o-2024-05-13",
                messages: [
                    {
                        "role": "system",
                        "content": "You are a javascript Unit test Expert at a software company: You are tasked to fix the errors for the given unit tests. The unit tests needs to run without and with everything that is used defined without need for manual correction, use Jest as testing framework and try to achieve maximum coverage. Output has to be raw code without any backticks.",
                    },
                    {
                        "role": "user",
                        "content": JSON.stringify(request)
                    }

                ],
                temperature: 0.1,
                max_tokens: 3000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
            console.log(response.choices[0].message.content);
            const dirName = path.dirname(testFile.filePath);
            const extName = path.extname(testFile.filePath);
            const baseName = path.basename(testFile.filePath, extName);
            const newBaseName = `${baseName}${extName}`;
            const newTestFilePath = path.join(dirName, newBaseName);
            try {
                const code = response.choices[0].message.content;
                fs.writeFileSync(newTestFilePath, code);
            } catch (e) {
                console.log(e);
            }

        }
    } else if (input instanceof Prompt) {


        for (const prompt of preparePrompts()) {
            const data = {
                prompt: prompt.getPrompt()
            };
            const str = JSON.stringify(data);
            const response = await openai.chat.completions.create({
                model: "gpt-4o-2024-05-13",
                messages: [
                    {
                        "role": "system",
                        "content": "You are a QA Engineer at a software company: You are tasked to generate unit tests for the package Async . The unit tests have to be without errors and with everything that is used defined without need for manual correction, use Jest as testing framework and try to achieve maximum coverage. Output has to be raw code without any backticks."
                    },
                    {
                        "role": "user",
                        "content": str
                    }
                ],
                temperature: 0.1,
                max_tokens: 1000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });
            console.log(response.choices[0].message.content);
            const functionName = prompt.getPrompt().taskDescription.match(/function called (\w+)/)[1];
            const code = response.choices[0].message.content;
            const filePath = path.join('output', `${functionName}.openai.test.js`).replace(/\\/g, '/');
            fs.writeFileSync(filePath, code);
        }
    }
}

generateContent(new Prompt());

