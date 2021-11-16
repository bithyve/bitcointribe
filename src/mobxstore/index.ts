import SettingsStore from './SettingsStore'

class Stores {
    public settingsStore: SettingsStore;

    constructor() {
      this.settingsStore = new SettingsStore()
    }
}

const stores = new Stores()
export default stores
