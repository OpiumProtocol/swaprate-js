import * as sigUtil from 'eth-sig-util'

import { EIP712Message } from './types'

type SignMessageArguments = {
  data: EIP712Message
  privateKey: Buffer
}

export const signMessage = ({ data, privateKey }: SignMessageArguments): string => {
  return sigUtil.signTypedData(privateKey, { data })
}
