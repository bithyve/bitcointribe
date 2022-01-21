import { observable, action } from 'mobx'
import RESTUtils from '../utils/ln/RESTUtils'
export default class InvoicesStore {
    @observable invoice: string = ''
    constructor() {

    }

    @action
    reset = () => {
        this.invoice = ''
    }

    @action
    public fetchAddress = async (node: any) => {
        try {
            await RESTUtils.getNewAddress(node).then((data: any) => {
                console.log("-------------")
                this.invoice = data.address
            })
        } catch {
            (err: any) => {
                console.log(err)
            }
        }
    }

    @action
    public fetchInvoice = async (node: any, expiry: number, memo: string, value: number) => {
        let body = {
          memo,
          value,
          expiry
        }
        try {
          await RESTUtils.createInvoice(node, body).then((resp: any) => {
            console.log(resp.payment_request, "+++++")
            // this.setState({address: resp.payment_request})
            this.invoice = resp.payment_request
          })
        } catch (err) {
          console.log(err)
          }
    }
}