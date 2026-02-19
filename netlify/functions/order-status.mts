import type { Config, Context } from "@netlify/functions";

type RawSaleOrder = {
  id: number;
  name: string;
  partner_id?: [number, string] | false;
  x_studio_avancee_du_projet?: number[] | [number, string][];
  x_studio_gestionnaire_de_projet?: [number, string] | false;
};

type RawStep = {
  id: number;
  x_name: string;
};

type RawUser = {
  id: number;
  name: string;
  phone?: string | false;
};

class HttpError extends Error {
  constructor(
    message: string,
    public status = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function getServerConfig() {
  const odooUrl = (Netlify.env.get("ODOO_URL") ?? "").replace(/\/$/, "");
  const odooDatabase = Netlify.env.get("ODOO_DATABASE") ?? "";
  const odooApiKey = Netlify.env.get("ODOO_API_KEY") ?? "";

  if (!odooUrl) throw new HttpError("ODOO_URL manquant", 500);
  if (!odooApiKey) throw new HttpError("ODOO_API_KEY manquant", 500);

  return { odooUrl, odooDatabase, odooApiKey };
}

async function odooCall<T>(
  cfg: ReturnType<typeof getServerConfig>,
  model: string,
  method: string,
  params: Record<string, unknown>
): Promise<T> {
  const url = `${cfg.odooUrl}/json/2/${encodeURIComponent(model)}/${encodeURIComponent(
    method
  )}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `bearer ${cfg.odooApiKey}`,
    "User-Agent": "livraison-bycommute-netlify-function/1.0",
  };

  if (cfg.odooDatabase) headers["X-Odoo-Database"] = cfg.odooDatabase;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const maybe = body as { message?: string };
    throw new HttpError(maybe?.message ?? `Odoo HTTP ${res.status}`, res.status, body);
  }

  return body as T;
}

function normalizeOrder(raw: RawSaleOrder) {
  const partnerName =
    Array.isArray(raw.partner_id) && raw.partner_id[1] ? raw.partner_id[1] : null;
  const projectManager =
    Array.isArray(raw.x_studio_gestionnaire_de_projet) &&
    raw.x_studio_gestionnaire_de_projet.length > 0
      ? raw.x_studio_gestionnaire_de_projet
      : null;
  const rawAvancee = raw.x_studio_avancee_du_projet;
  const avanceeIds = Array.isArray(rawAvancee)
    ? rawAvancee.map((v) => (Array.isArray(v) ? v[0] : v))
    : [];

  return {
    id: raw.id,
    name: raw.name,
    partnerName,
    projectManagerId: projectManager ? projectManager[0] : null,
    projectManagerName: projectManager ? projectManager[1] : null,
    avanceeIds,
  };
}

export default async (req: Request, _context: Context) => {
  try {
    const url = new URL(req.url);
    const reference = (url.searchParams.get("reference") ?? "").trim();

    if (!reference) {
      return Response.json(
        { error: "Le paramètre query `reference` est requis." },
        { status: 400 }
      );
    }

    const cfg = getServerConfig();

    const [orders, steps] = await Promise.all([
      odooCall<RawSaleOrder[]>(cfg, "sale.order", "search_read", {
        domain: [["name", "=", reference]],
        fields: [
          "name",
          "partner_id",
          "x_studio_avancee_du_projet",
          "x_studio_gestionnaire_de_projet",
        ],
        limit: 1,
      }),
      odooCall<RawStep[]>(cfg, "x_avancee_du_projet", "search_read", {
        domain: [],
        fields: ["id", "x_name"],
      }),
    ]);

    const order =
      Array.isArray(orders) && orders.length > 0 ? normalizeOrder(orders[0]) : null;
    const safeSteps = Array.isArray(steps) ? steps : [];
    let projectManagerPhone: string | null = null;

    if (order?.projectManagerId) {
      const users = await odooCall<RawUser[]>(cfg, "res.users", "read", {
        ids: [order.projectManagerId],
        fields: ["name", "phone"],
      });
      const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
      projectManagerPhone = typeof user?.phone === "string" ? user.phone : null;
    }

    return Response.json(
      {
        order: order
          ? {
              ...order,
              projectManagerPhone,
            }
          : null,
        steps: safeSteps,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(
        { error: error.message, details: error.details ?? null },
        { status: error.status }
      );
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/api/order-status",
};
