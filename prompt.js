class prompt {

    constructor() {
        this.prompt = {
            taskDescription: "",
            codeContext: {
                codeSnippet: "",
                functionDescription: ""
            }
        };
    }

    setTaskDescription(description) {
        this.prompt.taskDescription = description;
    }

    setCodeSnippet(code) {
        this.prompt.codeContext.codeSnippet = code;
    }

    setFunctionDescription(description) {
        this.prompt.codeContext.functionDescription = description;
    }

    getPrompt() {
        return this.prompt;
    }
}