import type { NextApiRequest, NextApiResponse } from 'next';

import { isValidObjectId } from 'mongoose';

import { database } from '../../../database';
import { IUser } from '../../../interfaces';
import { User } from '../../../models';

type Data =
    | { message: string; }
    | IUser[];

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'GET':
            return getUsers(req, res);

        case 'PUT':
            return updateUsers(req, res);

        default:
            return res.status(400).json({ message: 'Bad request' });
    }
}

const getUsers = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    await database.connect();

    const users = await User.find().select('-password').lean();

    await database.disconnect();

    return res.status(200).json(users);
};


const updateUsers = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { userId = '', role = '' } = req.body;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ message: 'No existe usuario con ese ID' });
    }
    
    const validMainRoles = ['admin', 'SEO', 'client'];
    
    if (!validMainRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol no permitido: ' + validMainRoles.join(', ') });
    }
    
    await database.connect();
    
    const user = await User.findById(userId);
    
    if (!user) {
        await database.disconnect();
        return res.status(404).json({ message: 'Usuario no encontrado: ' + userId });
    }
    
    user.role = role;
    await user.save();
    await database.disconnect();

    return res.status(200).json({ message: 'Usuario actualizado' });
};
