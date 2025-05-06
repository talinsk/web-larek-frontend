import { ICart, IProduct } from "../types";
import { IEvents } from "./base/events";

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