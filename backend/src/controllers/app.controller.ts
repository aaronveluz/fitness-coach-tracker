export function Base64Decode(str: string): string {
  return Buffer.from(str, 'base64').toString('utf-8');
}

export function Base64Encode(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}
