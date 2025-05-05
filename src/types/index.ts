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
    cost: number;
    addProduct(product: IProduct): void;
    removeProduct(product: IProduct): void;
    clear(): void;
}

export type TPaymentType = 'online' | 'deliver';

export interface IDeliveryInfo {
    paymentType: TPaymentType;
    address: string;
}

export interface ICustomerContact {
    email: string;
    phone: string;
}

export interface IOrderInfo extends IDeliveryInfo, ICustomerContact {
    total: number;
}

export interface IOrderResult {
    id: string;
    total: number;
}


// имплементация интерфейсов
export class Cart implements ICart {
    products: IProduct[];

    constructor(protected events: IEvents) {
    }

    get count(): number {
        return this.products.length;
    }

    get cost(): number {        
        return this.products.reduce(
            (accumulator, currentValue) => accumulator + (currentValue.price || 0),
            0,
        );
    }

    addProduct(product: IProduct): void {
        const index = this.products.findIndex(p => p.id == product.id);
        if (index < 0) {
            this.products.push(product);
            this.emitChangeCart();
        }
    }
    
    removeProduct(product: IProduct): void {
        const index = this.products.findIndex(p => p.id == product.id);
        if (index >= 0) {
            this.products.splice(index, 1);
            this.emitChangeCart();
        }
    }

    clear(): void {
        this.products = [];
        this.emitChangeCart();
    }

    private emitChangeCart() {
        this.events.emit('cart:change', {});
    }
}