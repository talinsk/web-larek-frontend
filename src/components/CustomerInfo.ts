import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";
import { Form } from "./common/Form"

interface ICustomerComponentInfo {
    email: string,
    phone: string
}

export class CustomerInfo extends Form<ICustomerComponentInfo> {
    protected _email: HTMLInputElement;
    protected _phone: HTMLInputElement;

    constructor(protected container: HTMLFormElement, events: IEvents, formName: string) {
        super(container, events, formName);
        
        this._email = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phone = ensureElement<HTMLInputElement>('input[name="phone"]', container);

        this._email.addEventListener('input', () => this.emitChanges());
        this._phone.addEventListener('input', () => this.emitChanges());
    }

    set email(value: string) {
        this._email.value = value;
    }

    set phone(value: string) {
        this._phone.value = value;
    }

    protected emitChanges() {
        this.onFormChange({
            email: this._email.value,
            phone: this._phone.value
        })
    }
}