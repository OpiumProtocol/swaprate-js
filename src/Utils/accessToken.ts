export type AccessToken = {
  ttl: number
  address: string
  signature: string
}

export const formAccessToken = ({ ttl, address, signature }: AccessToken): string => Buffer
  .from(JSON.stringify({
    ttl,
    address,
    signature
  }))
  .toString('base64')
