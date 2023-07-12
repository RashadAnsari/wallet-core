export function toHexString(byteArray) {
  return Array.from(byteArray, (byte) =>
    `0${(byte & 0xff).toString(16)}`.slice(-2),
  ).join('');
}

export function toTimestamp(strDate) {
  const dt = Date.parse(strDate);
  return dt / 1000; // convert to seconds.
}
