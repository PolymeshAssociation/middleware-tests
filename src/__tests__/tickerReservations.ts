import { assertTagPresent } from '~/assertions';
import { TestFactory } from '~/helpers';
import { RestClient } from '~/rest';
import { Identity } from '~/rest/identities/interfaces';
import { reserveTickerParams, transferTickerReservationParams } from '~/rest/tickerReservations';

const handles = ['issuer', 'receiver'];

describe('Ticker Reservations', () => {
  let restClient: RestClient;
  let signer: string;
  let issuer: Identity;
  let receiver: Identity;
  let ticker: string;
  /**
   * authId for transferring the reservation. Will be set after the transfer test case
   */
  let transferAuthId: string;

  beforeAll(async () => {
    const factory = await TestFactory.create({ handles });
    ({ restClient } = factory);
    issuer = factory.getSignerIdentity(handles[0]);
    receiver = factory.getSignerIdentity(handles[1]);

    ticker = factory.nextTicker();
    signer = issuer.signer;
  });

  it('should reserve a ticker', async () => {
    const params = reserveTickerParams(ticker, { signer });

    const result = await restClient.tickerReservations.reserve(params);

    expect(result).toEqual(assertTagPresent(expect, 'asset.registerTicker'));
  });

  it('should get details about the reservation', async () => {
    const result = await restClient.tickerReservations.getReservation(ticker);

    expect(result).toEqual(
      expect.objectContaining({
        owner: issuer.did,
        status: 'Reserved',
      })
    );
  });

  it('should extend a reservation', async () => {
    const result = await restClient.tickerReservations.extend(ticker, { signer });

    expect(result).toEqual(assertTagPresent(expect, 'asset.registerTicker'));
  });

  it('should transfer ownership', async () => {
    const params = transferTickerReservationParams(receiver.did, { signer });

    const result = await restClient.tickerReservations.transfer(ticker, params);

    expect(result.authorizationRequest).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        issuer: issuer.did,
        data: { type: 'TransferTicker', value: ticker },
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transferAuthId = (result.authorizationRequest as any).id;
    expect(transferAuthId).toEqual(expect.stringMatching(/\d+/));

    expect(result).toEqual(assertTagPresent(expect, 'identity.addAuthorization'));
  });

  it('should list an Identities reservations before accepting', async () => {
    const reservations = await restClient.tickerReservations.getIdentityReservations(receiver.did);

    expect(reservations).toEqual({ results: [] });
  });

  it('should accept the transfer', async () => {
    const params = { signer: receiver.signer };

    const result = await restClient.identities.acceptAuthorization(transferAuthId, params);

    expect(result).toEqual(assertTagPresent(expect, 'asset.acceptTickerTransfer'));
  });

  it('should list an Identities reservations after accepting', async () => {
    const reservations = await restClient.tickerReservations.getIdentityReservations(receiver.did);

    expect(reservations).toEqual({ results: [ticker] });
  });
});
