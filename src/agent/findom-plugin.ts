// src/agent/findom-plugin.ts

import { llmService } from './llm_service';

// Define Dialogue Layers
enum DialogueLayer {
    Horny,   // NSFW content
    Wallet,  // Financial commands and logic
}

// FinDom Plugin Class
export class FinDomPlugin {
    constructor() {
    }

    public generateResponse(message: any, userContext: any): string {
        const layer = this.determineLayer(message);

        if (layer === DialogueLayer.Wallet) {
            return this.handleWalletLayer(message, userContext);
        } else {
            return this.handleHornyLayer(message, userContext);
        }
    }

    private determineLayer(message: any): DialogueLayer {
        const walletKeywords = ['tribute', 'send', 'domme', 'balance'];
        const messageText = message.text.toLowerCase();

        if (walletKeywords.some(keyword => messageText.includes(keyword))) {
            return DialogueLayer.Wallet;
        }

        return DialogueLayer.Horny;
    }

    private handleWalletLayer(message: any, userContext: any): string {
        // More sophisticated financial dialogue
        const prompt = `User said: "${message.text}". User's financial history: ${JSON.stringify(userContext.financials)}. Generate a stern but clear financial command.`;
        return llmService.generateDialogue(prompt);
    }

    private handleHornyLayer(message: any, userContext: any): string {
        // More sophisticated NSFW dialogue
        const prompt = `User said: "${message.text}". User's history: ${JSON.stringify(userContext.interactions)}. Generate a dominant and enticing NSFW response.`;
        return llmService.generateDialogue(prompt);
    }
}
