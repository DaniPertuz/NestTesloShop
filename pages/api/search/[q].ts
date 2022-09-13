import type { NextApiRequest, NextApiResponse } from 'next';
import { database } from '../../../database';
import { Product } from '../../../models';
import { IProduct } from '../../../interfaces';

type Data =
    | { message: string; }
    | IProduct[];

const searchProducts = async (req: NextApiRequest, res: NextApiResponse) => {
    let { q = '' } = req.query;

    if (q.length === 0) {
        return res.status(400).json({
            message: 'Debe especificar la búsqueda'
        });
    }

    q = q.toString().toLowerCase();

    await database.connect();

    const products = await Product.find({
        $text: { $search: q }
    })
        .select('title images price inStock slug -_id')
        .lean();

    await database.disconnect();

    return res.status(200).json(products);
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'GET':
            return searchProducts(req, res);

        default:
            return res.status(400).json({
                message: 'Bad request'
            });
    }
}