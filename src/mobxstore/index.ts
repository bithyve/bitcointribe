import SettingsStore from './SettingsStore'
import TransactionsStore from './TransactionsStore';
import BalancesStore from './BalancesStore';
import InvoicesStore from './InvoicesStore';
import ChannelsStore from './ChannelsStore';
class Stores {
    public settingsStore: SettingsStore;
    public transactionsStore: TransactionsStore;
    public balancesStore: BalancesStore;
    public invoicesStore: InvoicesStore;
    public channelsStore: ChannelsStore;
    constructor() {
      this.settingsStore = new SettingsStore()
      this.transactionsStore = new TransactionsStore()
      this.balancesStore = new BalancesStore()
      this.invoicesStore = new InvoicesStore()
      this.channelsStore = new ChannelsStore()
    }
}

const stores = new Stores()
export default stores
