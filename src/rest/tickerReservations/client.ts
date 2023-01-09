import { RestClient } from '~/rest/client';
import { TxBase } from '~/rest/common';
import {
  reserveTickerParams,
  transferTickerReservationParams,
} from '~/rest/tickerReservations/params';

export class TickerReservations {
  constructor(private client: RestClient) {}

  public async reserve(params: ReturnType<typeof reserveTickerParams>): Promise<unknown> {
    return this.client.post('/ticker-reservations/reserve-ticker', params);
  }

  public async getReservation(ticker: string): Promise<unknown> {
    return this.client.get(`/ticker-reservations/${ticker}`);
  }

  public async extend(ticker: string, params: TxBase): Promise<unknown> {
    return this.client.post(`/ticker-reservations/${ticker}/extend`, { ...params });
  }

  public async transfer(
    ticker: string,
    params: ReturnType<typeof transferTickerReservationParams>
  ): Promise<Record<string, unknown>> {
    return this.client.post(`/ticker-reservations/${ticker}/transfer-ownership`, params);
  }

  public async getIdentityReservations(did: string): Promise<unknown> {
    return this.client.get(`/identities/${did}/ticker-reservations`);
  }
}
