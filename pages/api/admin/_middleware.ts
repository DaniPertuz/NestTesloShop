import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest | any, ev: NextFetchEvent) {

    const session: any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!session) {
        return new Response(JSON.stringify({ message: 'No autorizado' }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const validMainRoles = ['admin', 'SEO'];

    if (!validMainRoles.includes(session.user.role)) {
        return NextResponse.redirect('/');
    }

    return NextResponse.next();
}