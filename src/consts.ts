const prefixedDidLength = 66; // 64 bytes + 2 for `0x`

export const wellKnown = {
  bob: {
    did: '0x04'.padEnd(prefixedDidLength, '0'),
    mnemonic: '//Bob',
  },
} as const;

export enum AMQPTopics {
  Finalizations = 'Finalizations',
}
