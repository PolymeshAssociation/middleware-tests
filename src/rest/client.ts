import { assert } from 'console';
import fetch from 'cross-fetch';

import { Assets } from '~/rest/assets';
import { Compliance } from '~/rest/compliance';
import { Identities } from '~/rest/identities';
import { Portfolios } from '~/rest/portfolios';
import { Settlements } from '~/rest/settlements';
import { Subsidy } from '~/rest/subsidy';
import { TickerReservations } from '~/rest/tickerReservations';

export class RestClient {
  public assets: Assets;
  public compliance: Compliance;
  public identities: Identities;
  public settlements: Settlements;
  public subsidy: Subsidy;
  public tickerReservations: TickerReservations;
  public portfolios: Portfolios;

  constructor(public baseUrl: string) {
    this.assets = new Assets(this);
    this.compliance = new Compliance(this);
    this.identities = new Identities(this);
    this.settlements = new Settlements(this);
    this.subsidy = new Subsidy(this);
    this.tickerReservations = new TickerReservations(this);
    this.portfolios = new Portfolios(this);
  }

  public async get<T = unknown>(path: string): Promise<T> {
    const url = new URL(path, this.baseUrl).href;
    const method = 'GET';

    return this.fetch(url, method) as Promise<T>;
  }

  public async post<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
    const url = new URL(path, this.baseUrl).href;
    const method = 'POST';
    return this.fetch(url, method, body) as Promise<T>;
  }

  private async fetch(
    url: string,
    method: string,
    reqBody?: Record<string, unknown>
  ): Promise<unknown> {
    const body = JSON.stringify(reqBody ?? undefined);

    const response = await fetch(url, {
      headers: [['Content-Type', 'application/json']],
      method,
      body,
    });
    this.assertOk(response, { method, url });

    return response.json();
  }

  private assertOk(response: Response, opts: { method: string; url: string }) {
    const { method, url } = opts;
    const { status } = response;
    assert(status < 300, `${method}: ${url} had non 2xx status: ${status}`);
  }
}
