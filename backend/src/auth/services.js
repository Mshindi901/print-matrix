import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
class authService {
    constructor(authRepo) {
        this.authRepo = authRepo;
    };

    async registerUser(userData) {
        try {
            const isUser = await this.authRepo.findUserByEmail(userData.email);
            if (isUser) {
                throw new Error('User already exists');
                return null;
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = await this.authRepo.createUser({ ...userData, password_hashed: hashedPassword });
            return newUser;
        } catch(error) {
            console.error('Error registering user:', error);
            return null;
        }
    };

    async login(email, password) {
        try {
            const isUser = await this.authRepo.findUserByEmail(email);
            if (!isUser) {
                throw new Error('User not found');
                return null;
            };
            
            const isPasswordValid = await bcrypt.compare(password, isUser.password_hashed);
            if(!isPasswordValid){
                throw new Error('Invalid password');
                return null;
            };
            const token_sign = jwt.sign({ id: isUser.id, email: isUser.email, role: isUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return {
                token: token_sign,
                role:isUser.role
            };
        } catch(error) {
            console.error('Error logging in:', error);
            return null;
        }
    };
};

export default authService;
