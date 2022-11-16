import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';

export const randomNonce = (digits: number): string => {
  let output = '';
  for (let i = 0; i < digits; ++i) {
    output += Math.floor(Math.random() * 10).toString(10);
  }
  return output;
};

export const signer = 'alice';

export type LocalSigners = 'alice' | 'issuer' | 'investor';
export type LocalMnemonics = Record<LocalSigners, string>;

let localMnemonics: LocalMnemonics;

export const getLocalMnemonics = async (): Promise<LocalMnemonics> => {
  if (localMnemonics) return localMnemonics;

  await cryptoWaitReady();

  const [issuer, investor] = await Promise.all([mnemonicGenerate(), mnemonicGenerate()]);

  localMnemonics = {
    alice: '//Alice',
    issuer,
    investor,
  };

  return localMnemonics;
};
