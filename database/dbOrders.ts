import { isValidObjectId } from 'mongoose';

import { IOrder } from '../interfaces/order';
import { database } from '.';
import { Order } from '../models';

export const getOrderById = async (id: string): Promise<IOrder | null> => {
    if (!isValidObjectId(id)) return null;

    await database.connect();
    const order = await Order.findById(id).lean();
    await database.disconnect();

    if (!order) return null;

    return JSON.parse(JSON.stringify(order));
};

export const getOrdersByUser = async (userId: string): Promise<IOrder[]> => {
    if (!isValidObjectId(userId)) return [];

    await database.connect();
    const orders = await Order.find({ user: userId }).lean();
    await database.disconnect();

    return JSON.parse(JSON.stringify(orders));
};