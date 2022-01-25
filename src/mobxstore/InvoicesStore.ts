import { observable, action, makeObservable, runInAction } from 'mobx'
import RESTUtils from '../utils/ln/RESTUtils'
export default class InvoicesStore {
    invoice: string = ''
    constructor() {
        makeObservable(this, {
            invoice: observable,
            fetchAddress: action,
            fetchInvoice: action
        })
    }

    reset = () => {
        this.invoice = ''
    }

    public addSatToInvoice = (val:string) => {
        this.invoice = 'bitcoin:' + this.invoice + '?amount=' + val
    }

    public fetchAddress = async (node: any) => {
        try {
            await RESTUtils.getNewAddress(node).then((data: any) => {
                runInAction(() => {
                    this.invoice = data.address
                })
            })
        } catch {
            (err: any) => {
                console.log(err)
            }
        }
    }

    public fetchInvoice = async (node: any, expiry: number, memo: string, value: number) => {
        let body = {
            memo,
            value,
            expiry
        }
        try {
            await RESTUtils.createInvoice(node, body).then((resp: any) => {
                console.log(resp.payment_request, "+++++")
                runInAction(() => {
                    this.invoice = resp.payment_request
                })
            })
        } catch (err) {
            console.log(err)
        }
    }
}