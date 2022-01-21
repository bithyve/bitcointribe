import { observable, action } from 'mobx'
import RESTUtils from '../utils/ln/RESTUtils'
export default class BalancesStore {
  @observable onChainBalance: string = ''
  @observable offChainBalance: string = ''
  constructor() {

  }

  @action
  reset = () => {
    this.onChainBalance = ''
    this.offChainBalance = ''
  }

  @action
  public getOnChainBalance = async (node: any) => {
    try {
      await RESTUtils.getBlockchainBalance(node).then((data: any) => {
        console.log(data.total_balance, "total_balance")
        this.onChainBalance = data.total_balance
      })
    } catch {
      (err: any) => {
        console.log(err)
      }
    }
  }

  @action
  public getOffChainBalance = async (node: any) => {
    try {
      await RESTUtils.getLightningBalance(node).then((data: any) => {
        // console.log("<>><><>><><>")
        console.log(data.balance, "balance")
        this.offChainBalance = data.balance
      })

    } catch (err) {
      console.log(err)
    }
  }

}