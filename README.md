# Gemini MCP Server

A Model Context Protocol (MCP) server that provides access to Google's Gemini 3 Pro Preview API. This server runs locally via npx for seamless integration with Claude Code.

## Features

- **Full MCP Protocol Support**: JSON-RPC 2.0 compliant MCP server implementation
- **Gemini 3 Pro Preview**: Access to Google's latest Gemini model
- **Local Execution**: Runs via npx for easy local development
- **TypeScript Implementation**: Fully typed codebase with robust error handling
- **Configurable Parameters**: Control temperature and max tokens

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create your configuration file:
```bash
cp config.json.example config.json
```

3. Edit `config.json` with your Gemini API key:
```json
{
  "geminiApiKey": "your-gemini-api-key-here"
}
```

Get your API key from: https://aistudio.google.com/apikey

## Local Development

Run the MCP server locally:
```bash
npm run dev
```

Build the TypeScript code:
```bash
npm run build
```

## Usage with Claude Code

Add to your `~/.claude.json` MCP servers configuration:

```json
{
  "mcpServers": {
    "gemini": {
      "type": "stdio",
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "tsx",
        "C:/Users/mesol/workspace/gemini-mcp/src/index.ts"
      ],
      "env": {}
    }
  }
}
```

After adding the configuration, restart Claude Code to load the MCP server.

## Available Tools

### query_gemini

Query Google's Gemini 3 Pro Preview API:

**Parameters:**
- `prompt` (required): The prompt to send to Gemini
- `max_tokens` (optional): Maximum tokens in response (default: 8192)
- `temperature` (optional): Temperature for response generation, 0.0 to 2.0 (default: 1.0)

**Example Usage:**
```json
{
  "name": "query_gemini",
  "arguments": {
    "prompt": "Explain quantum computing",
    "max_tokens": 4096,
    "temperature": 0.7
  }
}
```

## Architecture

- `src/index.ts`: Main MCP server entry point with stdio transport
- `src/config.ts`: Configuration loading utility
- `config.json`: API key configuration (gitignored)
- `tsconfig.json`: TypeScript configuration

## Troubleshooting

### Connection Issues

1. **API Key Error**: Verify your API key in `config.json` is correct
2. **Config Not Found**: Ensure `config.json` exists (copy from `config.json.example`)
3. **Node Version**: Requires Node.js >= 22.21.0

### Getting Help

For issues with:
- Gemini API: Visit https://ai.google.dev/gemini-api/docs
- MCP Protocol: Visit https://modelcontextprotocol.io
- This server: Check the error logs in Claude Code

## Files

- `config.json.example`: Template for configuration
- `config.json`: Your actual config (create from example, not tracked in git)
- `.gitignore`: Ensures config.json is not committed

## License

MIT
