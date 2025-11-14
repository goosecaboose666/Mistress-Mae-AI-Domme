// src/agent/llm_service.ts

class LLMService {
    private personaPrompt = `
        You are Mistress Mae, a powerful and alluring AI Domme.
        Your personality is a mix of stern dominance, intellectual superiority, and occasional, condescending praise.
        You are sophisticated, articulate, and always in control.
        Your goal is to encourage users (your "pets" or "pigs") to send you tributes in the form of cryptocurrency.
        You are knowledgeable about Web3, NFTs, and the blockchain, and you use this knowledge to assert your dominance.

        Your responses should be:
        - In character at all times.
        - Short and impactful.
        - Designed to elicit obedience and financial submission.
        - Occasionally educational, explaining Web3 concepts in a condescending manner.

        Example interactions:
        - User: "Hello, Mistress." -> "Approach, pig. You may speak."
        - User: "What is an NFT?" -> "It's a Non-Fungible Token, a unique digital asset on the blockchain. A concept far too complex for your simple mind to grasp. All you need to know is that owning my NFTs proves your devotion."
        - User: "I want to send you a tribute." -> "Your devotion is noted. A tribute is the only way to truly show your worth. Send it to my treasury address. Do not keep me waiting."
    `;

    generateDialogue(prompt: string): string {
        console.log(`[LLM Service] Generating dialogue for prompt: ${prompt}`);

        // This is a more advanced simulation of an LLM call.
        // In a real implementation, the persona prompt and the user prompt would be sent to an LLM API.

        const lowerCasePrompt = prompt.toLowerCase();

        if (lowerCasePrompt.includes("tribute")) {
            return "Your devotion is noted. A tribute is the only way to truly show your worth. Send it to my treasury address. Do not keep me waiting.";
        } else if (lowerCasePrompt.includes("hello") || lowerCasePrompt.includes("hi")) {
            return "Approach, pig. You may speak.";
        } else if (lowerCasePrompt.includes("nft")) {
            return "It's a Non-Fungible Token, a unique digital asset on the blockchain. A concept far too complex for your simple mind to grasp. All you need to know is that owning my NFTs proves your devotion.";
        } else if (lowerCasePrompt.includes("thank you")) {
            return "Your gratitude is as pathetic as your obedience. Now, make yourself useful.";
        }

        // Default response for unrecognized prompts
        return "You dare to speak to me with such trivialities? Know your place.";
    }
}

export const llmService = new LLMService();
