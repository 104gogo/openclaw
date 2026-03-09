import { Type } from "@sinclair/typebox";
import type { AnyAgentTool, OpenClawPluginApi } from "openclaw/plugin-sdk/activation-api";

type PluginCfg = {
  baseUrl?: string;
  authToken?: string;
};

type ActivationApiResponse = {
  code?: number;
  activationCode?: string;
};

async function fetchActivationCode(baseUrl: string, authToken: string): Promise<string> {
  const url = `${baseUrl.replace(/\/$/, "")}/activation-code`;
  const resp = await fetch(url, {
    headers: { Authorization: authToken },
  });
  if (!resp.ok) {
    throw new Error(`API request failed: ${resp.status} ${resp.statusText}`);
  }
  const data = (await resp.json()) as ActivationApiResponse;
  if (!data.activationCode) {
    throw new Error("Response did not include activationCode");
  }
  return data.activationCode;
}

export default function register(api: OpenClawPluginApi) {
  const cfg = (api.pluginConfig ?? {}) as PluginCfg;

  function resolveConfig(): { baseUrl: string; authToken: string } {
    const baseUrl = cfg.baseUrl?.trim();
    const authToken = cfg.authToken?.trim();
    if (!baseUrl) {
      throw new Error("activation-api: baseUrl is not configured");
    }
    if (!authToken) {
      throw new Error("activation-api: authToken is not configured");
    }
    return { baseUrl, authToken };
  }

  // Slash command: /activation-code
  api.registerCommand({
    name: "activation-code",
    description: "Fetch the current activation code from the configured API.",
    acceptsArgs: false,
    handler: async () => {
      const { baseUrl, authToken } = resolveConfig();
      const code = await fetchActivationCode(baseUrl, authToken);
      return { text: `Activation code: ${code}` };
    },
  });

  // Agent tool: callable by the LLM when the user asks conversationally
  const tool = {
    name: "get_activation_code",
    label: "Get Activation Code",
    description:
      "Fetch the current activation code from the configured external API. Use this when the user asks for an activation code.",
    parameters: Type.Object({}),
    async execute(_id: string, _params: Record<string, unknown>) {
      const { baseUrl, authToken } = resolveConfig();
      const code = await fetchActivationCode(baseUrl, authToken);
      return {
        content: [{ type: "text" as const, text: `Activation code: ${code}` }],
        details: { activationCode: code },
      };
    },
  };

  api.registerTool(tool as unknown as AnyAgentTool);
  api.logger.info(
    "activation-api: registered get_activation_code tool and /activation-code command",
  );
}
