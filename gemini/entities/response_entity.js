export class Entity {
    constructor(candidates, usageMetadata) {
        this.candidates = candidates.map(candidate => ({
            content: candidate.content,
            finishReason: candidate.finishReason,
            safetyRatings: candidate.safetyRatings,
            index: candidate.index
        }));
        this.usageMetadata = usageMetadata;
    }
}

class Candidate {
    constructor(content, finishReason, safetyRatings, index) {
        this.content = content;
        this.finishReason = finishReason;
        this.safetyRatings = safetyRatings;
        this.index = index;
    }
}

class Content {
    constructor(role, parts) {
        this.role = role;
        this.parts = parts.map(part => new Part(part.text));
    }
}

class Part {
    constructor(text) {
        this.text = text;
    }
}

class SafetyRating {
    constructor(category, probability, probabilityScore, severity, severityScore) {
        this.category = category;
        this.probability = probability;
        this.probabilityScore = probabilityScore;
        this.severity = severity;
        this.severityScore = severityScore;
    }
}

class UsageMetadata {
    constructor(promptTokenCount, candidatesTokenCount, totalTokenCount) {
        this.promptTokenCount = promptTokenCount;
        this.candidatesTokenCount = candidatesTokenCount;
        this.totalTokenCount = totalTokenCount;
    }
}


export class Prompt {

    constructor() {
        this.Prompt = {
            taskDescription: "",
            codeContext: {
                codeSnippet: "",
                functionDescription: ""
            }
        };
    }

    setTaskDescription(description) {
        this.Prompt.taskDescription = description;
    }

    setCodeSnippet(code) {
        this.Prompt.codeContext.codeSnippet = code;
    }

    setFunctionDescription(params) {
        if(params.length === 0) {
            this.Prompt.codeContext.functionDescription = 'None';
            return;
        }
        this.Prompt.codeContext.functionDescription = `Parameters: ${params.join(', ')}`;
    }

    getPrompt() {
        return this.Prompt;
    }
}

