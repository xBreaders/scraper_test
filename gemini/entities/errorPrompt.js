export class TestError {
    constructor(testName, errorMessages) {
        this.test_name = testName;
        this.error_messages = errorMessages;
    }
}

export class TestFile {
    constructor(fileContents, errors, filePath) {
        this.fileContents = fileContents;
        this.errors = errors.map(error => new TestError(error.test_name, error.error_messages));
        this.filePath = filePath;
    }
}