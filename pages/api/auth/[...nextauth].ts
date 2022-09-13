import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { checkUserEmailPassword } from '../../../database/dbUsers';
import { dbUsers } from '../../../database';

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        // ...add more providers here
        Credentials({
            name: 'Custom Login',
            credentials: {
                email: { label: 'Correo', type: 'email', placeholder: 'correo@gmail.com' },
                password: { label: 'Contraseña', type: 'password', placeholder: 'Contraseña' }
            },
            async authorize(credentials) {
                return await checkUserEmailPassword(credentials!.email, credentials!.password);
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        })
    ],
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/register'
    },
    session: {
        maxAge: 2592000, // 30 días
        strategy: 'jwt',
        updateAge: 86400 // 1 día
    },
    callbacks: {
        async jwt({ token, account, user }) {
            if (account) {
                token.accessToken = account.access_token;
                switch (account.type) {

                    case 'oauth':
                        token.user = await dbUsers.oAuthToDbUser(user?.email || '', user?.name || '');
                        break;
                    case 'credentials':
                        token.user = user;
                        break;

                    default:
                        break;
                }
            }
            return token;
        },
        async session({ session, token, user }) {
            session.accessToken = token.accessToken;
            session.user = token.user as any;
            return session;
        }
    }
});