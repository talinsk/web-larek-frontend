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
    cost: number;
    toggleProduct(product: IProduct): void;
    clear(): void;
}

export type TPaymentType = 'online' | 'deliver';

export interface IOrderInfo {
    paymentType: TPaymentType;
    address: string;
    email: string;
    phone: string;
    total: number;
}

export interface IOrderResult {
    id: string;
    total: number;
}