import { IUser, ISizes } from './';

export interface IOrder {
    _id?: string;
    user?: IUser | string;
    orderItems: IOrderItem[];
    shippingAddress: ShippingAddress;
    billingAddress?: ShippingAddress;
    paymentResult?: string;
    numberOfItems: number;
    subtotal: number;
    tax: number;
    total: number;
    isPaid: boolean;
    paidAt?: string;
    transactionID?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IOrderItem {
    _id: string;
    title: string;
    size: ISizes;
    quantity: number;
    slug: string;
    image: string;
    price: number;
    gender: string;
}

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    address: string;
    address2?: string;
    zip: string;
    city: string;
    country: string;
    phone: string;
}