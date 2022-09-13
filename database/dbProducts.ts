import { database } from './';
import Product from '../models/Product';
import { IProduct } from '../interfaces';

export const getProductBySlug = async (slug: string): Promise<IProduct | null> => {
    await database.connect();

    const product = await Product.findOne({ slug }).lean();

    await database.disconnect();

    if (!product) {
        return null;
    }

    product.images = product.images.map(image => {
        return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`;
    });

    return JSON.parse(JSON.stringify(product));
};

interface ProductSlug {
    slug: string;
}

export const getAllProductsSlugs = async (): Promise<ProductSlug[]> => {
    await database.connect();

    const slugs = await Product.find().select('slug -_id').lean();

    await database.disconnect();

    return slugs;
};

export const getProductsByTerm = async (term: string): Promise<IProduct[]> => {
    term = term.toString().toLowerCase();

    await database.connect();

    const products = await Product.find({
        $text: { $search: term }
    })
        .select('title images price inStock slug -_id')
        .lean();

    await database.disconnect();

    const updatedProducts = products.map(product => {
        product.images = product.images.map(image => {
            return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`;
        });

        return product;
    });

    return updatedProducts;
};

export const getAllProducts = async (): Promise<IProduct[]> => {
    await database.connect();
    const products = await Product.find().lean();
    await database.disconnect();

    const updatedProducts = products.map(product => {
        product.images = product.images.map(image => {
            return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`;
        });

        return product;
    });

    return JSON.parse(JSON.stringify(updatedProducts));
};