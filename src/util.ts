export const randomNonce = (digits: number): string => {
  let output = '';
  for (let i = 0; i < digits; ++i) {
    output += Math.floor(Math.random() * 10).toString(10);
  }
  return output;
};

export const signer = 'alice';
