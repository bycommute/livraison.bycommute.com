/**
 * Client Odoo JSON-2 (Odoo 19+).
 * Doc: https://www.odoo.com/documentation/19.0/developer/reference/external_api.html
 *
 * POST /json/2/{model}/{method}
 * Headers: Authorization: bearer {API_KEY}, Content-Type: application/json, optional X-Odoo-Database
 * Body: JSON avec ids (optionnel), context (optionnel), puis paramètres nommés de la méthode.
 */

import { config } from '@/config/env'

export class OdooJson2Error extends Error {
  constructor(
    message: string,
    public status?: number,
    public body?: unknown
  ) {
    super(message)
    this.name = 'OdooJson2Error'
  }
}

function getBaseUrl(): string {
  const url = config.odooUrl.replace(/\/$/, '')
  if (!url) throw new OdooJson2Error('VITE_ODOO_URL is not set')
  return `${url}/json/2`
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `bearer ${config.odooApiKey}`,
    'User-Agent': 'livraison-bycommute/1.0',
  }
  if (config.odooDatabase) {
    headers['X-Odoo-Database'] = config.odooDatabase
  }
  return headers
}

/**
 * Appel JSON-2 : POST /json/2/{model}/{method} avec body = { context?, ids?, ...params }
 */
export async function odooCall<T>(
  model: string,
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const baseUrl = getBaseUrl()
  if (!config.odooApiKey) throw new OdooJson2Error('VITE_ODOO_API_KEY is not set')

  const url = `${baseUrl}/${encodeURIComponent(model)}/${encodeURIComponent(method)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  })

  const text = await res.text()
  let body: unknown
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!res.ok) {
    const err = body as { message?: string }
    throw new OdooJson2Error(
      err?.message ?? `HTTP ${res.status}`,
      res.status,
      body
    )
  }

  return body as T
}
