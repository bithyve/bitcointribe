import { observable, action, makeObservable, runInAction } from 'mobx'
import RESTUtils from '../utils/ln/RESTUtils'
export default class BalancesStore {
  onChainBalance: string = ''
  offChainBalance: string = ''
  constructor() {
    makeObservable(this, {
      onChainBalance: observable,
      offChainBalance: observable,
      getOnChainBalance: action,
      getOffChainBalance: action
    })
  }

  reset = () => {
    this.onChainBalance = ''
    this.offChainBalance = ''
  }

  public getOnChainBalance = async (node: any) => {
    try {
      await RESTUtils.getBlockchainBalance(node).then((data: any) => {
        console.log(data.total_balance, "total_balance")
        runInAction(() => { this.onChainBalance = data.total_balance })
      })
    } catch {
      (err: any) => {
        console.log(err)
      }
    }
  }


  public getOffChainBalance = async (node: any) => {
    try {
      await RESTUtils.getLightningBalance(node).then((data: any) => {
        // console.log("<>><><>><><>")
        console.log(data.balance, "balance")
        runInAction(() => {
          this.offChainBalance = data.balance
        })
      })

    } catch (err) {
      console.log(err)
    }
  }

}