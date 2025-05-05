import { ensureElement, getProductPriceText } from "../utils/utils";
import { Component } from "./base/Component";

interface ICardActions {
    onClick(): void;
}

export interface ICard {
    category: string;
    title: string;    
    image: string;
    price: number;
}

abstract class CardBase<T> extends Component<T> {
    protected _category: HTMLElement;
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _price: HTMLElement;

    constructor(protected blockName: string, container: HTMLElement) {
        super(container);

        this._category = ensureElement<HTMLElement>(`.${blockName}__category`, container);
        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._price = container.querySelector(`.${blockName}__price`);
    }

    set category(value: string) {
        this.setText(this._category, value);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set price(value: number) {
        this.setText(this._price, getProductPriceText(value));
    }
}

export class Card extends CardBase<ICard> {
    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(blockName, container);

        if (actions?.onClick) {
            container.addEventListener('click', actions.onClick);
        }
    }
}

export interface ICardPreview extends ICard {
    description: string;
    inCart: boolean;
}

export interface ICardPreviewActions {
    onAddButtonClick(): void;
    onRemoveButtonClick(): void;
}

export class CardPreview extends CardBase<ICardPreview> {
    protected _description: HTMLElement;
    protected _button: HTMLElement;

    constructor(protected blockName: string, container: HTMLElement, inCart: boolean, actions?: ICardPreviewActions) {
        super(blockName, container);

        this._description = ensureElement<HTMLElement>(`.${blockName}__text`, container);
        this._button = ensureElement<HTMLButtonElement>(`.${blockName}__button`, container);

        if (!inCart && actions?.onAddButtonClick) {
            this._button.addEventListener('click', actions.onAddButtonClick);
        }
        else if (inCart && actions?.onRemoveButtonClick) {
            this._button.addEventListener('click', actions.onRemoveButtonClick);
        }
    }

    set description(value: number) {
        this.setText(this._description, value);
    }

    set inCart(value: boolean) {
        this.setText(this._button, value ? 'Убрать' : 'Купить');
    }
}