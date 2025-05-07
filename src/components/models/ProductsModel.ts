import { ICustomerInfo, IDeliveryInfo, IOrderInfo, IProduct, IValidationResult } from "../../types";
import { IEvents } from "../base/events";

export class ProductsModel {
    protected _products: IProduct[] = [];

    constructor(protected events: IEvents) {        
    }

    get products(): IProduct[] {
        return this._products;
    }

    set products(value: IProduct[]) {
        this._products = value;
        this.events.emit('products:loaded');
    }
}