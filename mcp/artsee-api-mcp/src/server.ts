/**
 * Artsee 院校 / 专业 / AI 咨询 — MCP Streamable HTTP 服务
 *
 * 将现有 Next.js BFF（`/api/v1/*`）封装为 MCP tools，供 Cursor / Claude 等通过 HTTP 调用。
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import * as z from "zod/v4";

const baseUrl = (process.env.ARTSEE_API_BASE_URL ?? "http://127.0.0.1:9090").replace(/\/$/, "");
const port = Number.parseInt(process.env.MCP_HTTP_PORT ?? "3845", 10);

function api(path: string, query?: Record<string, string | undefined>): string {
  const u = new URL(path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") u.searchParams.set(k, v);
    }
  }
  return u.toString();
}

async function fetchJson(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; body: string; json?: unknown }> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  const t = process.env.ARTSEE_BEARER_TOKEN;
  if (t) headers.Authorization = `Bearer ${t}`;

  const r = await fetch(url, { ...init, headers });
  const text = await r.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { ok: r.ok, status: r.status, body: text, json };
}

function textResult(obj: unknown): { content: { type: "text"; text: string }[] } {
  return {
    content: [
      {
        type: "text",
        text: typeof obj === "string" ? obj : JSON.stringify(obj, null, 2),
      },
    ],
  };
}

function getServer(): McpServer {
  const server = new McpServer(
    {
      name: "artsee-schools-api",
      version: "1.0.0",
    },
    {
      instructions: `Artsee（Artiqore）艺术留学后端查询：院校列表/详情、专业（项目）列表/详情、AI 院校咨询。
所有数据来自 Next BFF \`${baseUrl}/api/v1/*\`。申请维度在数据模型中对应 \`programs\` 表（学位项目/申请项目）。`,
    }
  );

  server.registerTool(
    "artsee_schools_list",
    {
      description:
        "分页查询院校列表。支持国家/城市/类型/关键词、QS 艺术排名区间。对应 GET /api/v1/schools",
      inputSchema: {
        limit: z.string().optional().describe("每页条数 1–100，默认 20"),
        offset: z.string().optional().describe("偏移，默认 0"),
        country: z.string().optional().describe("国家精确匹配"),
        city: z.string().optional().describe("城市精确匹配"),
        school_type: z.string().optional().describe("院校类型"),
        keyword: z.string().optional().describe("中英文校名关键词"),
        min_rank: z.string().optional().describe("QS 艺术排名下限（与后端字段 qs_art_rank 一致）"),
        max_rank: z.string().optional().describe("QS 艺术排名上限"),
      },
    },
    async (args) => {
      const url = api("/api/v1/schools", args as Record<string, string | undefined>);
      const res = await fetchJson(url);
      return textResult(res.json ?? { error: res.body, httpStatus: res.status });
    }
  );

  server.registerTool(
    "artsee_school_get",
    {
      description: "按 ID 获取院校详情。对应 GET /api/v1/schools/:id",
      inputSchema: {
        id: z.string().describe("院校 id（与 schools.id 一致）"),
      },
    },
    async ({ id }) => {
      const url = api(`/api/v1/schools/${encodeURIComponent(id)}`);
      const res = await fetchJson(url);
      return textResult(res.json ?? { error: res.body, httpStatus: res.status });
    }
  );

  server.registerTool(
    "artsee_programs_list",
    {
      description:
        "分页查询专业/学位项目（programs）。可按 school_id、学位类型、关键词、是否要求作品集、category_id（若库表已关联）筛选。对应 GET /api/v1/programs",
      inputSchema: {
        limit: z.string().optional().describe("每页条数 1–100，默认 20"),
        offset: z.string().optional().describe("偏移"),
        school_id: z.string().optional().describe("院校 ID"),
        degree_type: z.string().optional().describe("学位类型，如 MA / MFA"),
        keyword: z.string().optional().describe("专业名称关键词"),
        requires_portfolio: z.enum(["true", "false"]).optional().describe("是否要求作品集"),
        category_id: z.string().optional().describe("艺术分类 ID（需 program_art_categories 关联）"),
      },
    },
    async (args) => {
      const url = api("/api/v1/programs", args as Record<string, string | undefined>);
      const res = await fetchJson(url);
      return textResult(res.json ?? { error: res.body, httpStatus: res.status });
    }
  );

  server.registerTool(
    "artsee_program_get",
    {
      description: "按数字 ID 获取单个专业/项目详情。对应 GET /api/v1/programs/:id",
      inputSchema: {
        id: z.string().describe("programs 表主键（整数）"),
      },
    },
    async ({ id }) => {
      const url = api(`/api/v1/programs/${encodeURIComponent(id)}`);
      const res = await fetchJson(url);
      return textResult(res.json ?? { error: res.body, httpStatus: res.status });
    }
  );

  server.registerTool(
    "artsee_ai_school_consult",
    {
      description:
        "基于数据库中院校记录 + 大模型生成艺术留学咨询回答（需服务端配置 OPENAI_API_KEY 或 MOONSHOT_API_KEY）。对应 POST /api/v1/ai/schools/search",
      inputSchema: {
        query: z.string().describe("用户问题，自然语言"),
        limitSchools: z.number().optional().describe("拉取院校条数上限，默认 20，最大 80"),
      },
    },
    async ({ query, limitSchools }) => {
      const url = api("/api/v1/ai/schools/search");
      const res = await fetchJson(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          limitSchools: limitSchools ?? 20,
        }),
      });
      return textResult(res.json ?? { error: res.body, httpStatus: res.status });
    }
  );

  return server;
}

const app = createMcpExpressApp({ host: process.env.MCP_HTTP_HOST ?? "127.0.0.1" });

app.post("/mcp", async (req, res) => {
  const mcp = getServer();
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await mcp.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      transport.close();
      mcp.close();
    });
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: e instanceof Error ? e.message : String(e) },
        id: null,
      });
    }
  }
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "artsee-api-mcp",
    artseeApiBase: baseUrl,
    mcpEndpoint: "/mcp",
  });
});

app.listen(port, () => {
  console.log(`[artsee-api-mcp] Streamable HTTP MCP listening on http://127.0.0.1:${port}/mcp`);
  console.log(`[artsee-api-mcp] BFF base: ${baseUrl}`);
  console.log(`[artsee-api-mcp] Health: http://127.0.0.1:${port}/health`);
});
