#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GoogleGenAI } from '@google/genai';
import { loadConfig } from './config.js';

const DEFAULT_MODEL = 'gemini-3.1-pro-preview';

let ai: GoogleGenAI;

try {
  const config = loadConfig();
  ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
} catch (error) {
  console.error('Failed to load config:', error instanceof Error ? error.message : 'Unknown error');
  console.error('Make sure to create config.json from config.json.example');
  process.exit(1);
}

const server = new Server(
  {
    name: 'gemini-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_gemini',
        description: 'Query Google Gemini 3.1 Pro Preview API with a prompt and get a response',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The prompt to send to Gemini',
            },
            max_tokens: {
              type: 'number',
              description: 'Maximum tokens in the response',
              default: 8192,
            },
            temperature: {
              type: 'number',
              description: 'Temperature for response generation (0.0 to 2.0)',
              default: 1.0,
              minimum: 0.0,
              maximum: 2.0,
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'get_model_info',
        description: 'Get information about a Gemini model',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'The model to get info for',
              default: DEFAULT_MODEL,
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'query_gemini') {
    const {
      prompt,
      max_tokens = 8192,
      temperature = 1.0,
    } = request.params.arguments as {
      prompt: string;
      max_tokens?: number;
      temperature?: number;
    };

    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
      });

      return {
        content: [
          {
            type: 'text',
            text: response.text || 'No response received',
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error querying Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === 'get_model_info') {
    const { model = DEFAULT_MODEL } = (request.params.arguments || {}) as {
      model?: string;
    };

    try {
      const info = await ai.models.get({ model });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                name: info.name,
                displayName: info.displayName,
                version: info.version,
                description: info.description,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving model info: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gemini MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
