class userService{
    constructor(userRepo){
        this.userRepo = userRepo
    };

    async getUserById(id) {
        try {
            const user = await this.userRepo.findUserById(id);
            if (!user) {
                throw new Error('User not found');
                return null;
            };
            return user;
        } catch(error) {
            console.error('Error fetching user by ID:', error);
            return null;
        }
    };

    async getUserByEmail(email) {
        try {
            const user = await this.userRepofindUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
                return null;
            };
            return user;
        } catch(error) {
            console.error('Error fetching user by email:', error);
            return null;
        }
    };

    async getUserByPhone(phone) {
        try {
            const user = await this.userRepo.findByPhone(phone);
            if (!user) {
                throw new Error('User not found');
                return null;
            };
            return user;
        } catch(error) {
            console.error('Error fetching user by phone:', error);
            return null;
        }
    };

    async getAllUsers(){
        try {
            const users = await this.userRepo.findAllUsers();
            if(!users){
                throw new Error('Error with getting all users');
                return null
            };
            return users;
        } catch (error) {
            console.error(`Error with getting all users: ${error}`);
            return null;
        }
    }

    async updateUser(id, updatedData) {
        try {
            const isUser = await this.userRepo.findUserById(id);
            if (!isUser) {
                throw new Error('User not found');
                return null;
            };
            const updatedUser = await this.authRepo.updateUser(id, updatedData);
            return updatedUser;
        } catch(error) {
            console.error('Error updating user:', error);
            return null;
        }
    };

    async deleteUser(id) {
        try {
            const isUser = await this.userRepo.findUserById(id);
            if (!isUser) {
                throw new Error('User not found');
                return null;
            };
            const deletedUser = await this.authRepo.deleteUser(id);
            return deletedUser;
        } catch(error) {
            console.error('Error deleting user:', error);
            return null;
        }
    }
};

export default userService;