import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { database } from '../../../database';
import { User } from '../../../models';
import { jwt, validations } from '../../../utils';

type Data =
    | { message: string; }
    | {
        token: string;
        user: {
            email: string;
            name: string;
            role: string;
        };
    };

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'POST':
            return registerUser(req, res);

        default:
            res.status(400).json({
                message: 'Bad request'
            });
    }
}

const registerUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { email = '', password = '', name = '' } = req.body as { email: string, password: string, name: string; };

    if (password.length < 6) {
        return res.status(400).json({
            message: 'Contraseña debe ser mayor a 6 caracteres'
        });
    }

    if (name.length < 3) {
        return res.status(400).json({
            message: 'Nombre debe ser mayor a 2 caracteres'
        });
    }

    await database.connect();

    const user = await User.findOne({ email });

    if (!validations.isValidEmail(email)) {
        return res.status(400).json({
            message: 'Correo no válido'
        });
    }

    if (user) {
        await database.disconnect();
        return res.status(400).json({
            message: 'Credenciales registradas previamente'
        });
    }

    const newUser = new User({
        email: email.toLocaleLowerCase(),
        password: bcrypt.hashSync(password),
        role: 'client',
        name
    });

    try {
        await newUser.save({ validateBeforeSave: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Revisar logs del servidor'
        });
    }

    const { role, _id } = newUser;

    const token = jwt.signToken(_id, email);

    return res.status(200).json({
        token,
        user: {
            email, role, name
        }
    });
};
