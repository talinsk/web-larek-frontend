import { IEvents } from "../components/base/events";

export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;
}

export interface ICart {
    products: IProduct[];
    count: number;
    cost?: number;
    addProduct(product: IProduct): void;
    removeProduct(product: IProduct): void;
    clear(): void;
}

export type TPaymentType = 'online' | 'cash';

export interface IDeliveryInfo {
    paymentType: TPaymentType;
    address: string;
}

export interface ICustomerInfo {
    email: string;
    phone: string;
}

export interface IOrderInfo extends IDeliveryInfo, ICustomerInfo {
    total: number;
}

export interface IOrderResult {
    id: string;
    total: number;
}

export interface IValidationResult {
    valid: boolean,
    errors: string[]
}

// имплементация интерфейсов
export class Cart implements ICart {
    protected _products: IProduct[] = [];

    constructor(protected events: IEvents) {
    }

    get count(): number {
        return this._products.length;
    }

    get cost(): number {
        if (this._products.some(p => p.price === null)) {
            return null;
        }

        return this._products.reduce(
            (accumulator, currentValue) => accumulator + (currentValue.price || 0),
            0,
        );
    }

    get products(): IProduct[] {
        return [...this._products];
    }

    addProduct(product: IProduct): void {
        const index = this._products.findIndex(p => p.id == product.id);
        if (index < 0) {
            this._products.push(product);
            this.emitChangeCart();
        }
    }
    
    removeProduct(product: IProduct): void {
        const index = this._products.findIndex(p => p.id == product.id);
        if (index >= 0) {
            this._products.splice(index, 1);
            this.emitChangeCart();
        }
    }

    clear(): void {
        this._products = [];
        this.emitChangeCart();
    }

    private emitChangeCart() {
        this.events.emit('cart:change', {});
    }
}