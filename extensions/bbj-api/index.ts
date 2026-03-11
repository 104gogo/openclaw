import { Type } from "@sinclair/typebox";
import type { AnyAgentTool, OpenClawPluginApi } from "openclaw/plugin-sdk";

type PluginCfg = {
  baseUrl?: string;
};

type BbjResponse = {
  code: number;
  message: string;
  data?: unknown[];
};

async function createActivationCode(
  baseUrl: string,
  validDays: number,
  count: number,
  remark: string,
  price?: number,
  settlement?: string,
  liveDuration?: number,
): Promise<BbjResponse> {
  const url = `${baseUrl.replace(/\/$/, "")}/invite-code/create/${validDays}/${count}`;

  const params = new URLSearchParams();
  params.append("remark", encodeURIComponent(remark));
  if (price !== undefined) params.append("price", String(price));
  if (settlement) params.append("settlement", settlement);
  if (liveDuration !== undefined) params.append("liveDuration", String(liveDuration));

  const fullUrl = `${url}?${params.toString()}`;

  const resp = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!resp.ok) {
    throw new Error(`API request failed: ${resp.status} ${resp.statusText}`);
  }

  const data = (await resp.json()) as BbjResponse;
  return data;
}

export default function register(api: OpenClawPluginApi) {
  const cfg = (api.pluginConfig ?? {}) as PluginCfg;

  function resolveConfig(): { baseUrl: string } {
    const baseUrl = cfg.baseUrl?.trim();
    if (!baseUrl) {
      throw new Error("bbj-api: baseUrl is not configured");
    }
    return { baseUrl };
  }

  // Agent tool: callable by the LLM
  const tool = {
    name: "bbj_create_activation_code",
    label: "创建播播机激活码",
    description: "批量创建播播机激活码",
    parameters: Type.Object({
      validDays: Type.String({
        description: "有效期：1=1天, 30=30天, 180=180天, 365=365天, 1001=1小时, 1008=8小时",
      }),
      count: Type.String({ description: "生成数量" }),
      remark: Type.String({ description: "备注信息" }),
      price: Type.Optional(Type.String({ description: "售价（可选）" })),
      settlement: Type.Optional(Type.String({ description: "结算方式，固定值 real（可选）" })),
      liveDuration: Type.Optional(Type.String({ description: "直播时长秒，0=不限制（可选）" })),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { baseUrl } = resolveConfig();

      const result = await createActivationCode(
        baseUrl,
        Number(params.validDays),
        Number(params.count),
        String(params.remark),
        params.price ? Number(params.price) : undefined,
        params.settlement ? String(params.settlement) : undefined,
        params.liveDuration ? Number(params.liveDuration) : undefined,
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        details: result,
      };
    },
  };

  api.registerTool(tool as unknown as AnyAgentTool);
  api.logger.info("bbj-api: registered bbj_create_activation_code tool");
}
