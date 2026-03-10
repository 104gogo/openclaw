---
name: activation-api
description: Fetch the current activation code from a configured external HTTP API. Activate when user asks for an activation code, activation key, or mentions "激活码" / "激活密钥".
command-dispatch: tool
command-tool: get_activation_code
metadata: { "openclaw": { "requires": { "config": ["plugins.entries.activation-api.enabled"] } } }
---

# Activation API

Use the `get_activation_code` tool to fetch the current activation code from the configured external API.

Do not generate, guess, or make up the code — always call the tool to get the real value.

## Tool

`get_activation_code` takes no parameters. It reads `baseUrl` and `authToken` from the plugin config (`plugins.entries.activation-api.config`).

## Configuration

Plugin config lives under `plugins.entries.activation-api.config`:

- `baseUrl`: base URL of the API server (e.g. `http://localhost:3000`)
- `authToken`: authorization token sent in the `Authorization` header
