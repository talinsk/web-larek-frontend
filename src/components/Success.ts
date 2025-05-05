import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

interface ISuccessView {
    description: string;
}

interface ISuccessViewActions {
    onContinueClick(): void;
}

export class Success extends Component<ISuccessView> {
    protected _description: HTMLElement;
    protected _buttonContinue: HTMLButtonElement;
    protected _cartPrice: HTMLElement;
    
    constructor(container: HTMLElement, actions?: ISuccessViewActions) {
        super(container);

        this._description = ensureElement<HTMLElement>(`.order-success__description`, container);
        this._buttonContinue = ensureElement<HTMLButtonElement>(`.order-success__close`, container);

        if (actions.onContinueClick) {
            this._buttonContinue.addEventListener('click', actions.onContinueClick);
        }
    }

    set description(value: string) {
        this.setText(this._description, value);
    }
}