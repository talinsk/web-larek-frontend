export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;
}

export interface ICart {
    products: IProduct[];
    count: number;
    cost?: number;
    addProduct(product: IProduct): void;
    removeProduct(product: IProduct): void;
    clear(): void;
}

export type TPaymentType = 'online' | 'cash';

export interface IDeliveryInfo {
    payment: TPaymentType;
    address: string;
}

export interface ICustomerInfo {
    email: string;
    phone: string;
}

export interface IOrderInfo extends IDeliveryInfo, ICustomerInfo {
    total: number;
    items: string[];
}

export interface IOrderResult {
    id: string;
    total: number;
}

export interface IValidationResult {
    valid: boolean;
    errors: string[];
}

export interface IVisualState{
    cartModalIsVisible: boolean;
}