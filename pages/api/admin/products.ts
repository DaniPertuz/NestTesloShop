import type { NextApiRequest, NextApiResponse } from 'next';

import { isValidObjectId } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary'

import { database } from '../../../database';
import { IProduct } from '../../../interfaces';
import Product from '../../../models/Product';

cloudinary.config(process.env.CLOUDINARY_URL || '');

type Data =
    | { message: string; }
    | IProduct
    | IProduct[];

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'GET':
            return getProducts(req, res);
        case 'POST':
            return createProduct(req, res);
            break;
        case 'PUT':
            return updateProduct(req, res);

        default:
            return res.status(400).json({ message: 'Bad request' });
    }
}

const getProducts = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    await database.connect();

    const products = await Product.find()
        .sort({ title: 'asc' })
        .lean();

    await database.disconnect();

    return res.status(200).json(products);
};

const updateProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { _id = '', images = [] } = req.body as IProduct;

    if (isValidObjectId(_id)) {
        return res.status(400).json({ message: 'El ID del producto no es válido' });
    }

    if (images.length < 2) {
        return res.status(400).json({ message: 'Es necesario al menos dos imágenes' });
    }

    try {
        await database.connect();
        const product = await Product.findById(_id);

        if (!product) {
            await database.disconnect();
            return res.status(400).json({ message: 'No existe producto con ese ID' });
        }

        product.images.forEach(async (image) => {
            if (!images.includes(image)) {
                const [fileID, extension] = image.substring(image.lastIndexOf('/') + 1).split('.');
                await cloudinary.uploader.destroy(fileID);
            }
        });
        await product.update(req.body);
        await database.disconnect();

        return res.status(200).json(product);
    } catch (error) {
        console.error(error);
        await database.disconnect();
        return res.status(400).json({ message: 'Problemas con el servidor. Revisar consola' });
    }
};

const createProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { images = [] } = req.body as IProduct;
    
    if (images.length < 2) {
        return res.status(400).json({ message: 'Es necesario al menos dos imágenes' });
    }
    
    try {
        await database.connect();
        
        const productInDB = await Product.findOne({ slug: req.body.slug });
        
        if (productInDB) {
            return res.status(400).json({ message: 'Ya existe un producto con ese slug' });
        }
        
        const product = new Product(req.body);
        await product.save();
        await database.disconnect();

        return res.status(201).json(product);
    } catch (error) {
        console.error(error);
        await database.disconnect();
        return res.status(400).json({ message: 'Problemas con el servidor. Revisar consola' });
    }
};

