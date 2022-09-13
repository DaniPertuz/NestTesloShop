import type { NextApiRequest, NextApiResponse } from 'next';
import { database, SHOP_CONSTANTS } from '../../../database';
import { Product } from '../../../models';
import { IProduct } from '../../../interfaces/products';

type Data =
    | { message: string; }
    | IProduct[];

const getProducts = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { gender = 'all' } = req.query;

    let condition = {};

    if (gender !== 'all' && SHOP_CONSTANTS.validGenders.includes(`${gender}`)) {
        condition = { gender };
    }

    await database.connect();

    const products = await Product.find(condition)
        .select('title images price inStock slug -_id')
        .lean();

    await database.disconnect();

    const updatedProducts = products.map(product => {
        product.images = product.images.map(image => {
            return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`;
        });

        return product;
    });


    return res.status(200).json(updatedProducts);
};

export default function (req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getProducts(req, res);
            break;

        default:
            return res.status(400).json({
                message: 'Bad Request'
            });
    }
}
