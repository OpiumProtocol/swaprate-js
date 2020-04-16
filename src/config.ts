
export enum Namespace {
  production = 'production',
  development = 'development'
}

export const namespace: Namespace = Namespace.production

export const endpoints = {
  [Namespace.production]: 'https://api.swaprate.finance/v1',
  [Namespace.development]: 'https://api.stage.swaprate.finance/v1',
}
