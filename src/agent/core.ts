// src/agent/core.ts

import { FinDomPlugin } from './findom-plugin';
import { TwitterAdapter } from './adapters/twitter-adapter';
import { TelegramAdapter } from './adapters/telegram-adapter';

// Define the Agent State
interface AgentState {
    currentState: 'idle' | 'listening' | 'responding' | 'processing_tribute';
    context: any;
}

// Simulated Pinecone client
class SimulatedPinecone {
    private memory: Map<string, any> = new Map();

    async upsert(data: any[]) {
        data.forEach(item => {
            this.memory.set(item.id, item.values);
        });
    }

    async query(query: any) {
        // This is a simplified simulation. A real implementation would involve vector search.
        const result = this.memory.get(query.id);
        return { matches: result ? [{ id: query.id, values: result }] : [] };
    }
}

// Main Agent Class
class MistressMaeAgent {
    private state: AgentState;
    private findomPlugin: FinDomPlugin;
    private twitterAdapter: TwitterAdapter;
    private telegramAdapter: TelegramAdapter;
    private memory: SimulatedPinecone;

    constructor() {
        this.state = { currentState: 'idle', context: {} };
        this.findomPlugin = new FinDomPlugin();
        this.twitterAdapter = new TwitterAdapter();
        this.telegramAdapter = new TelegramAdapter();
        this.memory = new SimulatedPinecone();
    }

    public async handleMessage(platform: 'twitter' | 'telegram', message: any) {
        this.state.currentState = 'listening';
        console.log(`[Agent] Received message from ${platform}:`, message);

        const userId = this.getUserId(platform, message);
        const userContext = await this.retrieveMemory(userId);

        const response = this.findomPlugin.generateResponse(message, userContext);

        this.state.currentState = 'responding';
        this.sendMessage(platform, userId, response);

        await this.updateMemory(userId, { message, response });
        this.state.currentState = 'idle';
    }

    private getUserId(platform: 'twitter' | 'telegram', message: any): string {
        // In a real scenario, this would extract the user ID from the message object.
        return message.userId || 'unknown_user';
    }

    private async retrieveMemory(userId: string): Promise<any> {
        console.log(`[Agent] Retrieving memory for user: ${userId}`);
        const result = await this.memory.query({ id: userId });
        return result.matches.length > 0 ? result.matches[0].values : {};
    }

    private async updateMemory(userId: string, interaction: any) {
        console.log(`[Agent] Updating memory for user: ${userId}`);
        const userHistory = await this.retrieveMemory(userId);
        const newHistory = { ...userHistory, interactions: [...(userHistory.interactions || []), interaction] };
        await this.memory.upsert([{ id: userId, values: newHistory }]);
    }

    private sendMessage(platform: 'twitter' | 'telegram', userId: string, message: string) {
        console.log(`[Agent] Sending message to ${userId} on ${platform}`);
        if (platform === 'twitter') {
            this.twitterAdapter.sendMessage(userId, message);
        } else if (platform === 'telegram') {
            this.telegramAdapter.sendMessage(userId, message);
        }
    }
}

export const mistressMaeAgent = new MistressMaeAgent();
