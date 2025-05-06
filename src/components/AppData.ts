import { ICart, ICustomerInfo, IDeliveryInfo, IOrderInfo, IProduct } from "../types";
import { IEvents } from "./base/events";

export class AppData {
    protected _deliveryInfo: IDeliveryInfo;
    protected _customerInfo: ICustomerInfo;
    protected _products: IProduct[] = [];

    constructor(protected events: IEvents) {        
    }

    get products(): IProduct[] {
        return this._products;
    }

    set products(value: IProduct[]) {
        this._products = value;
    }

    get deliveryInfo(): IDeliveryInfo {
        return {...this._deliveryInfo};
    }

    get customerInfo(): ICustomerInfo {
        return {...this._customerInfo};
    }
    
    setDeliveryInfo(deliveryInfo: IDeliveryInfo) {
        this._deliveryInfo = {...deliveryInfo};
    }

    setCustomerInfo(customerInfo: ICustomerInfo) {
        this._customerInfo = {...customerInfo};
    }

    clearOrderInfo() {
        this._deliveryInfo = this._customerInfo = null;
    }
}