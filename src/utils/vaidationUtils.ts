import { ICustomerInfo, IDeliveryInfo, IValidationResult } from "../types";

export function validateDeliveryInfo(deliveryInfo: IDeliveryInfo): IValidationResult {
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

export function validateCustomerInfo(customerInfo: ICustomerInfo): IValidationResult {
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
