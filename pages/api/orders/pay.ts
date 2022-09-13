import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { IPaypal } from '../../../interfaces';
import { database } from '../../../database';
import { Order } from '../../../models';

type Data = {
    message: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'POST':
            return payOrder(req, res);

        default:
            return res.status(404).json({ message: 'Bad request' });
    }
}

const getPaypalBearerToken = async (): Promise<string | null> => {
    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    const base64Token = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`, 'utf-8').toString('base64');
    const body = new URLSearchParams('grant_type=client_credentials');

    try {
        const { data } = await axios.post(process.env.PAYPAL_OAUTH_URL || '', body, {
            headers: {
                'Authorization': `Basic ${base64Token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return data.access_token;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(error.response?.data);
        } else {
            console.error(error);
        }

        return null;
    }
};

const payOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const paypalBearerToken = await getPaypalBearerToken();

    if (!paypalBearerToken) {
        return res.status(400).json({ message: 'No se pudo confirmar token de paypal' });
    }

    const { transactionId = '', orderId = '' } = req.body;

    const { data } = await axios.get<IPaypal.PaypalOrderStatusResponse>(`${process.env.PAYPAL_ORDERS_URL}/${transactionId}`, {
        headers: {
            'Authorization': `Bearer ${paypalBearerToken}`
        }
    });

    if (data.status !== 'COMPLETED') {
        return res.status(401).json({ message: 'Orden no reconocida' });
    }
    
    await database.connect();
    
    const dbOrder = await Order.findById(orderId);
    
    if (!dbOrder) {
        await database.disconnect();
        return res.status(400).json({ message: 'Orden no existe en base de datos' });
    }
    
    if (dbOrder.total !== Number(data.purchase_units[0].amount.value)) {
        await database.disconnect();
        return res.status(400).json({ message: 'Los montos de Paypal y nuestra orden no son iguales' });
    }

    dbOrder.transactionID = transactionId;
    dbOrder.isPaid = true;

    await dbOrder.save();

    await database.disconnect();

    return res.status(200).json({ message: 'Orden pagada' });
};
