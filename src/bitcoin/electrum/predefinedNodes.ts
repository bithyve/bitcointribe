import { NodeDetail } from './interface'

export const predefinedTestnetNodes: NodeDetail[] = [
  {
    id: 333, // sequence 3-x-x; avoids collision w/ own node
    host: 'testnet.qtornado.com',
    port: '51002',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
]

export const predefinedMainnetNodes: NodeDetail[] = [
  {
    id: 444, // sequence 4-x-x; avoids collision w/ own node
    host: 'electrumx-core.1209k.com',
    port: '50002',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
  {
    id: 445,
    host: 'bitcoin.lukechilds.co',
    port: '50002',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
  {
    id: 446,
    host: 'ecdsa.net',
    port: '110',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
  {
    id: 447,
    host: 'electrum.jochen-hoenicke.de',
    port: '50006',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
]
