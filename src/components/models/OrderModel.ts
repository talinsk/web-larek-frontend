import { ICustomerInfo, IDeliveryInfo, IValidationResult } from "../../types";

export class OrderModel {
    protected _deliveryInfo: IDeliveryInfo;
    protected _customerInfo: ICustomerInfo;

    get deliveryInfo(): IDeliveryInfo {
        return {...this._deliveryInfo};
    }

    set deliveryInfo(value: IDeliveryInfo) {
        this._deliveryInfo = {...value};
    }

    get customerInfo(): ICustomerInfo {
        return {...this._customerInfo};
    }

    set customerInfo(value: ICustomerInfo) {
        this._customerInfo = {...value};
    }

    clearOrderInfo() {
        this._deliveryInfo = this._customerInfo = null;
    }

    validateDeliveryInfo(deliveryInfo: IDeliveryInfo): IValidationResult {
        const errors: string[] = [];
        if (!deliveryInfo.address) {
            errors.push('Необходимо указать адрес доставки');
        }
    
        if (!deliveryInfo.payment) {
            errors.push('Необходимо указать способ оплаты');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    validateCustomerInfo(customerInfo: ICustomerInfo): IValidationResult {
        const errors: string[] = [];
        if (!customerInfo.email) {
            errors.push('Необходимо указать адрес электронной почты');
        }
    
        if (!customerInfo.phone) {
            errors.push('Необходимо указать номер телефона');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}