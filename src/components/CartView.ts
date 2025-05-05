import { IProduct } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

interface ICartItemView {
    index: number;
    title: string;
    price: string;
}

interface ICartItemViewActions {
    onRemoveItem(): void;
}

export class CartItemView extends Component<ICartItemView> {
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _buttonRemove: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICartItemViewActions) {
        super(container);

        this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);
        this._title = ensureElement<HTMLElement>(`.card__title`, container);
        this._price = ensureElement<HTMLElement>(`.card__price`, container);
        this._buttonRemove = ensureElement<HTMLButtonElement>(`.basket__item-delete`, container);

        if (actions.onRemoveItem) {
            this._buttonRemove.addEventListener('click', actions.onRemoveItem);
        }
    }

    set index(value: number) {
        this.setText(this._index, value);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number) {
        this.setText(this._price, value);
    }
}

interface ICartView {
    total: string;
    items: HTMLElement[];
}

interface ICartViewActions {
    onPlaceOrderClick(): void;
}

export class CartView extends Component<ICartView> {
    protected _list: HTMLElement;
    protected _buttonPlaceOrder: HTMLButtonElement;
    protected _cartPrice: HTMLElement;
    
    constructor(container: HTMLElement, actions?: ICartViewActions) {
        super(container);

        this._list = ensureElement<HTMLElement>(`.basket__list`, container);
        this._buttonPlaceOrder = ensureElement<HTMLButtonElement>(`.basket__button`, container);
        this._cartPrice = ensureElement<HTMLElement>(`.basket__price`, container);        

        if (actions.onPlaceOrderClick) {
            this._buttonPlaceOrder.addEventListener('click', actions.onPlaceOrderClick);
        }
    }

    set items(values: HTMLElement[]) {
        this._list.replaceChildren(...values);
    }

    set total(value: string) {
        this.setText(this._cartPrice, value);
    }
}