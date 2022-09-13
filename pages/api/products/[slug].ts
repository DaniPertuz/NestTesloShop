import type { NextApiRequest, NextApiResponse } from 'next';
import { database } from '../../../database';
import { Product } from '../../../models';
import { IProduct } from '../../../interfaces/products';

type Data =
    | { message: string; }
    | IProduct;

const getProductBySlug = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    await database.connect();

    const { slug } = req.query;

    const product = await Product.findOne({ slug })
        // .select('title images price inStock slug -_id')
        .lean();

    await database.disconnect();

    if (!product) {
        return res.status(404).json({
            message: 'Producto no encontrado'
        });
    }

    product.images = product.images.map(image => {
        return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`;
    });

    return res.status(200).json(product);
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'GET':
            return getProductBySlug(req, res);

        default:
            return res.status(400).json({
                message: 'Bad Request'
            });
    }
}
