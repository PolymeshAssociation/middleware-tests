export const alphabet = [...Array(26)].map((val, i) => String.fromCharCode(i + 65));

export const randomNonce = (digits: number): string => {
  let output = '';
  for (let i = 0; i < digits; ++i) {
    output += Math.floor(Math.random() * 10).toString(10);
  }
  return output;
};

export const randomString = (length = 6, adjust = 0): string => {
  const timestamp = new Date().getTime();

  // Ensure that the adjustment wraps around within the range of possible hash values for the given length
  const hashValue = timestamp + (adjust % Math.pow(26, length));

  let result = '';
  let number = hashValue;

  for (let i = 0; i < length; i++) {
    // Use a rotating modulus for each character to avoid long chains of the same character
    const mod = 26 - i || 26; // Avoid modulus 0 which would cause a division by zero
    const charIndex = (number % mod) + i;

    // Wrap around if the index exceeds the alphabet length
    result = alphabet[charIndex % 26] + result;
    number = Math.floor(number / 26);
  }

  return result;
};
