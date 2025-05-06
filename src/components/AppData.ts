import { ICart, ICustomerInfo, IDeliveryInfo, IOrderInfo, IProduct } from "../types";
import { IEvents } from "./base/events";

export class AppData {
    protected _order: IOrderInfo = AppData.getEmptyOrder();
    protected _products: IProduct[] = [];

    constructor(protected events: IEvents) {        
    }

    get products(): IProduct[] {
        return this._products;
    }

    set products(value: IProduct[]) {
        this._products = value;
    }

    getOrder(cart: ICart): IOrderInfo {
        this._order.total = cart.cost;
        this._order.items = cart.products.map(p => p.id);
        return {...this._order};
    }
    
    setDeliveryInfo(deliveryInfo: IDeliveryInfo) {
        Object.assign(this._order, deliveryInfo);
    }

    setContactInfo(customerInfo: ICustomerInfo) {
        Object.assign(this._order, customerInfo);
    }

    clearOrder() {
        this._order = AppData.getEmptyOrder();
    }

    private static getEmptyOrder() : IOrderInfo {
        return {
            address: '',
            phone: '',
            email: '',
            total: 0,
            payment: "online",
            items: []
        };
    }
}