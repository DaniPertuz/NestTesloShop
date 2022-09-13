import { Box, Typography, CircularProgress } from '@mui/material';

export const FullScreenLoading = () => {
    return (
        <Box
            sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
            display={'flex'}
            justifyContent='center'
            flexDirection={'column'}
            alignItems={'center'}
            height='calc(100vh - 200px)'
        >
            <Typography sx={{ mb: 3 }} variant="h2" fontWeight={200} fontSize={20}>Cargando...</Typography>
            <CircularProgress thickness={2} />
        </Box>
    );
};
