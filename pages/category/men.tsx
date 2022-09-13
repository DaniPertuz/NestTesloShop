import { ShopLayout } from '../../components/layouts';
import { Box, Typography } from '@mui/material';
import { useProducts } from '../../hooks';
import { FullScreenLoading } from '../../components/ui';
import { ProductList } from '../../components/products';

const MenPage = () => {

    const { products, isLoading } = useProducts('/products?gender=men');

    return (
        <ShopLayout
            title='Teslo Shop - Men'
            pageDescription='Encuentra los mejores productos de Teslo para hombres aquí'
        >
            <Typography variant='h1' component={'h1'}>Tienda</Typography>
            <Typography variant='h2' sx={{ mb: 1 }}>Todos los productos para hombre</Typography>
            {
                isLoading
                    ? <FullScreenLoading />
                    : <ProductList products={products} />
            }
        </ShopLayout>
    );
};

export default MenPage;