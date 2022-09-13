import { ShopLayout } from '../../components/layouts';
import { Box, Typography } from '@mui/material';
import { useProducts } from '../../hooks';
import { FullScreenLoading } from '../../components/ui';
import { ProductList } from '../../components/products';

const KidPage = () => {

    const { products, isLoading } = useProducts('/products?gender=kid');

    return (
        <ShopLayout
            title='Teslo Shop - Kids'
            pageDescription='Encuentra los mejores productos de Teslo para niños aquí'
        >
            <Typography variant='h1' component={'h1'}>Tienda</Typography>
            <Typography variant='h2' sx={{ mb: 1 }}>Todos los productos para niño/a</Typography>
            {
                isLoading
                    ? <FullScreenLoading />
                    : <ProductList products={products} />
            }
        </ShopLayout>
    );
};

export default KidPage;