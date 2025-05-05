import { TPaymentType } from "../types"
import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";
import { Form } from "./common/Form"

interface IDeliveryComponentInfo {
    paymentType: TPaymentType,
    address: string
}

export class DeliveryInfo extends Form<IDeliveryComponentInfo> {
    protected _address: HTMLInputElement;
    protected _card: HTMLButtonElement;
    protected _cash: HTMLButtonElement;
    protected _paymentType: TPaymentType;

    static readonly _altActiveClass = "button_alt-active";

    constructor(protected container: HTMLFormElement, events: IEvents, formName: string) {
        super(container, events, formName);
        
        this._address = ensureElement<HTMLInputElement>('input[name="address"]', container);
        this._card = ensureElement<HTMLButtonElement>('button[name="card"]', container);
        this._cash = ensureElement<HTMLButtonElement>('button[name="cash"]', container);

        this._address.addEventListener('input', () => this.emitChanges());
        
        this._card.addEventListener('click', () => {
            this.paymentType = "online";
            this.emitChanges();
        })

        this._cash.addEventListener('click', () => {
            this.paymentType = "cash";
            this.emitChanges();
        })
    }

    set address(value: string) {
        this._address.value = value;
    }

    set paymentType(value: TPaymentType) {
        this._paymentType = value;
        this._card.classList.remove(DeliveryInfo._altActiveClass);
        this._cash.classList.remove(DeliveryInfo._altActiveClass);

        if (value === "online") {
            this._card.classList.add(DeliveryInfo._altActiveClass);
        }
        else if (value === "cash") {
            this._cash.classList.add(DeliveryInfo._altActiveClass);
        }
    }

    protected emitChanges() {
        this.onFormChange({
            address: this._address.value,
            paymentType: this._paymentType
        })
    }
}