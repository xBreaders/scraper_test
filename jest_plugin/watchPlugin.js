import fs from "fs";

function removeColorCodes(data) {
    // Define a regex to match ANSI color codes
    const colorCodeRegex = /\u001b\[\d{1,2}m/g;

    // Iterate over errors and clean up error messages
    data.errors.forEach(error => {
        error.error_messages = error.error_messages.map(message =>
            message.replace(colorCodeRegex, '')
        );
    });

    return data;
}


function extractFileContent(jsonData)
{
    // Parse JSON data if it's provided as a string
    if (typeof jsonData === 'string') {
        jsonData = JSON.parse(jsonData);
    }

    const testFilePath = jsonData.testFilePath;
    let fileContents = '';
    try {
        if (fs.existsSync(testFilePath)) {
            fileContents = fs.readFileSync(testFilePath, { encoding: 'utf8' });
        } else {
            console.log(`File not found: ${testFilePath}`);
            return;
        }
    } catch (err) {
        console.error(`Error reading file: ${err}`);
        return;
    }

    const errors = jsonData.testResults
        .filter(result => result.status !== 'passed')
        .map(result => ({
            test_name: result.fullName,
            error_messages: result.failureMessages.map(message => message.split(' at ')[0])
        }));

    removeColorCodes({ errors })

    // Return the content of the file and any errors
    return {
        fileContents,
        errors,
        testFilePath
    };
}

export default class watchPlugin
{
    apply(jestHooks) {
        jestHooks.onTestRunComplete((results) => {
            const passedTests = results.testResults.filter(testResult => testResult.numPassingTests > 0);
            for (const testResult of passedTests) {
                console.log(`Test passed: ${testResult.testFilePath.split('/').pop()}`);
            }
            const failedTests = results.testResults.filter(testResult => testResult.numFailingTests > 0);

            // Extract the content of the test file and any errors
            const fileContentAndErrors = failedTests.map(extractFileContent);

            // Write the file content and errors to a file
            fs.writeFileSync('file_content_and_errors.json', JSON.stringify(fileContentAndErrors, null, 2));

            this.rerun  = false;

        });
    }


}


