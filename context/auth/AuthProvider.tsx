import { FC, useEffect, useReducer } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { tesloApi } from '../../api';
import { IUser } from '../../interfaces';
import { AuthContext, authReducer } from './';
import Cookie from 'js-cookie';
import axios, { AxiosError } from 'axios';

export interface AuthState {
    isLoggedIn: boolean;
    user?: IUser;
}

const AUTH_INITIALSTATE: AuthState = {
    isLoggedIn: false,
    user: undefined
};

export const AuthProvider: FC = ({ children }) => {
    const router = useRouter();
    const { data, status } = useSession();
    const [state, dispatch] = useReducer(authReducer, AUTH_INITIALSTATE);

    useEffect(() => {
        if (status === 'authenticated') {
            dispatch({ type: '[Auth] - Login', payload: data?.user as IUser });
        }
    }, [status, data]);

    // useEffect(() => {
    //     checkToken();
    // }, []);

    const checkToken = async () => {

        if (!Cookie.get('token')) return;
        try {
            const { data } = await tesloApi.get('/user/validate-token');
            const { token, user } = data;

            Cookie.set('token', token);
            dispatch({ type: '[Auth] - Login', payload: user });
        } catch (error) {
            Cookie.remove('token');
        }
    };

    const loginUser = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data } = await tesloApi.post('/user/login', { email, password });
            const { token, user } = data;

            Cookie.set('token', token);
            dispatch({ type: '[Auth] - Login', payload: user });

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const registerUser = async (name: string, email: string, password: string): Promise<{ hasError: boolean; message?: string; }> => {
        try {
            const { data } = await tesloApi.post('/user/register', { name, email, password });
            const { token, user } = data;

            Cookie.set('token', token);
            dispatch({ type: '[Auth] - Login', payload: user });

            return {
                hasError: false
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // const { message } = error.response?.data as { message: string; }
                const err = error as AxiosError;
                return {
                    hasError: true,
                    message: err.message
                };
            }

            return {
                hasError: true,
                message: 'No se pudo crear el usuario. Intente de nuevo.'
            };
        }
    };

    const logout = () => {
        Cookie.remove('cart');
        Cookie.remove('firstName');
        Cookie.remove('lastName');
        Cookie.remove('address');
        Cookie.remove('address2');
        Cookie.remove('zip');
        Cookie.remove('city');
        Cookie.remove('country');
        Cookie.remove('phone');

        signOut();
        
        // router.reload();
        // Cookie.remove('token');
    };

    return (
        <AuthContext.Provider value={{
            ...state,
            loginUser,
            registerUser,
            logout
        }}
        >
            {children}
        </AuthContext.Provider>
    );
};