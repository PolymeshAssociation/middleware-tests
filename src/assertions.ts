export const assertTagPresent = (expect: jest.Expect, tag: string): jest.Expect => {
  return expect.objectContaining({
    transactions: expect.arrayContaining([
      expect.objectContaining({
        transactionTag: tag,
      }),
    ]),
  });
};

export const assertTagsPresent = (expect: jest.Expect, tag: string): jest.Expect => {
  return expect.objectContaining({
    transactions: expect.arrayContaining([
      expect.objectContaining({
        transactionTags: expect.arrayContaining([tag]),
      }),
    ]),
  });
};
