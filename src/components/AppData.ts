import { ICart, ICustomerInfo, IDeliveryInfo, IOrderInfo, IValidationResult } from "../types";
import { IEvents } from "./base/events";
import { CustomerInfo } from "./CustomerInfo";
import { DeliveryInfo } from "./DeliveryInfo";

export class AppData {
    protected _cart: ICart;
    protected _cartIsVisible: boolean;
    protected _order: IOrderInfo = AppData.getEmptyOrder();

    protected _deliveryInfoComponent: DeliveryInfo;
    protected _customerInfoComponent: CustomerInfo;

    constructor(protected events: IEvents, cart: ICart) {
        this._cart = cart;
        this._cartIsVisible = false;
    }

    get cart(): ICart {
        return this._cart;
    }

    get cartIsVisible(): boolean {
        return this._cartIsVisible;
    }

    get order(): IOrderInfo {
        this._order.total = this.cart.cost;
        this._order.items = this.cart.products.map(p => p.id);
        return {...this._order};
    }

    set cartIsVisible(value) {
        this._cartIsVisible = value;
    }
    
    set deliveryInfoComponent(value: DeliveryInfo) {
        this._deliveryInfoComponent = value;
    }

    set customerInfoComponent(value: CustomerInfo) {
        this._customerInfoComponent = value;
    }

    setDeliveryInfo(deliveryInfo: IDeliveryInfo) {
        Object.assign(this._order, deliveryInfo);

        const { valid, errors } = this.validateDeliveryInfo();
        if (this._deliveryInfoComponent) {
            this._deliveryInfoComponent.valid = valid;
            this._deliveryInfoComponent.errors = errors.join("; ");
        }
    }

    protected validateDeliveryInfo(): IValidationResult {
        const errors: string[] = [];
        if (!this._order.address) {
            errors.push('Необходимо указать адрес доставки');
        }

        if (!this._order.payment) {
            errors.push('Необходимо указать способ оплаты');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    setContactInfo(customerInfo: ICustomerInfo) {
        Object.assign(this._order, customerInfo);

        const { valid, errors } = this.validateCustomerInfo();
        if (this._customerInfoComponent) {
            this._customerInfoComponent.valid = valid;
            this._customerInfoComponent.errors = errors.join("; ");
        }
    }

    protected validateCustomerInfo(): IValidationResult {
        const errors: string[] = [];
        if (!this._order.email) {
            errors.push('Необходимо указать адрес электронной почты');
        }

        if (!this._order.phone) {
            errors.push('Необходимо указать номер телефона');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
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