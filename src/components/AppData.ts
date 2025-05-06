import { ICart, ICustomerInfo, IDeliveryInfo, IOrderInfo, IProduct, IValidationResult } from "../types";
import { IEvents } from "./base/events";

export class AppData {
    protected _cart: ICart;
    protected _order: IOrderInfo = AppData.getEmptyOrder();
    protected _products: IProduct[] = [];

    constructor(protected events: IEvents, cart: ICart) {
        this._cart = cart;
    }

    get products(): IProduct[] {
        return this._products;
    }

    set products(value: IProduct[]) {
        this._products = value;
    }

    get cart(): ICart {
        return this._cart;
    }

    get order(): IOrderInfo {
        this._order.total = this.cart.cost;
        this._order.items = this.cart.products.map(p => p.id);
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