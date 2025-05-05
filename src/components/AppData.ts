import { ICart } from "../types";
import { IEvents } from "./base/events";

export class AppData {
    protected _cart: ICart;
    protected _cartIsVisible: boolean;

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

    set cartIsVisible(value) {
        this._cartIsVisible = value;
    }
    
    private emitEvent(event: string, payload?: object) {
        this.events.emit(event, payload ?? {});
    }
}