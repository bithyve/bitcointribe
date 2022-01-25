import SettingsStore from './SettingsStore'
import ChannelsStore from './ChannelsStore'
import InvoicesStore from './InvoicesStore'
import NodeInfoStore from './NodeInfoStore'
import TransactionsStore from './TransactionsStore'
import BalanceStore from './BalanceStore'
import UnitsStore from './UnitsStore'
import PaymentsStore from './PaymentsStore'
import FeeStore from './FeeStore'
import FiatStore from './FiatStore'
import UTXOsStore from './UTXOsStore'
import ActivityStore from './ActivityStore'

class Stores {
    public settingsStore: SettingsStore;
    public channelsStore: ChannelsStore;
    public invoicesStore: InvoicesStore;
    public nodeInfoStore: NodeInfoStore;
    public fiatStore: FiatStore;
    public transactionsStore: TransactionsStore;
    public walletStore: BalanceStore;
    public unitsStore: UnitsStore;
    public paymentsStore: PaymentsStore;
    public feeStore: FeeStore;
    public utxosStore: UTXOsStore;
    public activityStore: ActivityStore;

    constructor() {
      this.settingsStore = new SettingsStore()
      this.fiatStore = new FiatStore( this.settingsStore )
      this.channelsStore = new ChannelsStore( this.settingsStore )
      this.invoicesStore = new InvoicesStore( this.settingsStore )
      this.nodeInfoStore = new NodeInfoStore( this.settingsStore )
      this.transactionsStore = new TransactionsStore( this.settingsStore )
      this.walletStore = new BalanceStore( this.settingsStore )
      this.unitsStore = new UnitsStore( this.settingsStore, this.fiatStore )
      this.paymentsStore = new PaymentsStore(
        this.settingsStore,
        this.channelsStore
      )
      this.feeStore = new FeeStore( this.settingsStore )
      this.nodeInfoStore = new NodeInfoStore( this.settingsStore )
      this.utxosStore = new UTXOsStore( this.settingsStore )
      this.activityStore = new ActivityStore(
        this.settingsStore,
        this.paymentsStore,
        this.invoicesStore,
        this.transactionsStore
      )
    }
}

const stores = new Stores()
export default stores
