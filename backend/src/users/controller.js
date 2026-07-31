import User from '../auth/user-schema.js';
import AuthRepository from '../auth/repository.js';
import userService from './service.js';

const repo = new AuthRepository(User);
const service = new userService(repo);

export const getById = async(req, res) => {
    try {
        const id = req.user.id;
        if(!id){
            return res.status(400).json({success: false, message: 'Not Authenticated'});
        };
        const user = await service.getUserById(id);
        if(!user){
            return res.status(400).json({success: false, message: 'Failed to get user'})
        };
        return res.status(200).json({success: true, message: 'user fetched', data: user})
    } catch (error) {
        console.error(`Error with getting user by id: ${error}`);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};

export const getByEmail = async(req, res) => {
    try {
        const email = req.params;
        if(!email){
            return res.status(400).json({success: false, message: 'Provide email'});
        };
        const user = await service.getUserByEmail(email);
        if(!user){
            return res.status(400).json({success: false, message: 'Failed to get user'})
        };
        return res.status(200).json({success: true, message: 'Fetched user', data:user})
    } catch (error) {
        console.error(`Error with getting user by email: ${error}`);
        return res.status(500).json({success: false, message: 'Internal server Error'})
    }
};

export const getByPhone = async(req, res) => {
    try {
        const phone = req.body;
        if(!phone){
            return res.status(400).json({success: false, message: 'Provide phone'})
        };
        const user = await service.getUserByPhone(phone);
        if(!user){
            return res.status(400).json({success: false, message: 'Failed to fertch user'})
        };
        return res.status(200).json({success: true, message: 'Fetched user', data:user})
    } catch (error) {
        console.error(`Error with getting user by phone: ${error}`);
        return res.status(500).json({success: false, message: 'Internal server Error'})
    }
};

export const getAll = async(req, res) => {
    try {
        const users = await service.getAllUsers();
        if(!users){
            return res.status(400).json({success: false, message: 'No users or API failed'});
        };
        return res.status(200).json({success: true, message: 'Fetched users', data:users});
    } catch (error) {
        console.error(`Error with getting all users: ${error}`);
        return res.status(500).json({success: false, message: 'Internal server Error'})
    };
};

export const update = async(req, res) => {
    try {
        const id = req.user.id;
        if(!id){
            return res.status(400).json({success: false, message: 'Not authenticated'})
        };
        const { first_name, last_name, email, phone } = req.body;
        if(!first_name || !last_name || !email || !phone){
            return res.status(400).json({success:false, message: 'Provide Info'});
        };
        const updatedUser = await service.updateUser(id, { first_name, last_name, email, phone, password, role });
        if(!updatedUser){
            return res.status(400).json({success: false, message: "Failed to update user"});
        };
        return res.status(200).json({success: true, message: 'User updated'});
    } catch (error) {
        console.error(`Error with updating user: ${error}`);
        return res.status(500).json({success: false, message: 'Internal server Error'})
    }
};

export const deleteUser = async(req, res) => {
    try {
        const id = req.params;
        if(!id){
            return res.status(400).json({success:false, message:'Provide user id'})
        };
        const deletedUser = await service.deleteUser(id);
        if(!deleteUser){
            return res.status(400).json({success:false, message: 'Failed to delete user'});
        };
        return res.status(200).json({success:true,message:'Deleted user'});
    } catch (error) {
        console.error(`Error with updating user: ${error}`);
        return res.status(500).json({success: false, message: 'Internal server Error'})
    }
};