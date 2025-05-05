import {Component} from "./base/Component";
import {IEvents} from "./base/events";
import {ensureElement} from "../utils/utils";

interface IPage {
    counter: number;
    catalog: HTMLElement[];
}

interface IPageActions {
    onCartClick(): void
}

export class Page extends Component<IPage> {
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _basket: HTMLElement;

    constructor(container: HTMLElement, actions?: IPageActions) {
        super(container);

        this._counter = ensureElement<HTMLElement>('.header__basket-counter');
        this._catalog = ensureElement<HTMLElement>('.gallery');
        this._basket = ensureElement<HTMLElement>('.header__basket');

        if (actions?.onCartClick) {
            this._basket.addEventListener('click', actions?.onCartClick);
        }
    }

    set counter(value: number) {
        this.setText(this._counter, String(value));
    }

    set catalog(items: HTMLElement[]) {
        this._catalog.replaceChildren(...items);
    }
}