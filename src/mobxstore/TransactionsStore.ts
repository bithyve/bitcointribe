import { makeObservable, observable, action, computed } from 'mobx'
import RESTUtils from '../utils/ln/RESTUtils'
import Transaction from '../models/Transaction'
export default class TransactionsStore {
    @observable transactions: Array<Transaction> = []

    constructor() {
    }

    @action
    reset = () => {
        this.transactions = []
    }

    @action
    public fetchTransactions = async (node: any) => {
        try {
            await RESTUtils.getTransactions(node).then((data: any) => {
                this.transactions = data.transactions
                .slice()
                .reverse()
                .map((tx: any) => new Transaction(tx));
            })
        } catch {
            (err: any) => {
                console.log(err)
            }
        }
    };

}