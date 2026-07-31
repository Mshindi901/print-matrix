class AuthRepository {
    constructor(usermodel, rolemodel){
        this.usermodel = usermodel
        this.rolemodel = rolemodel
    };

    async createUser(userData){
        try {
            const newUser = await this.usermodel.create(userData);
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    };

    async findUserByEmail(email){
        try {
            const user = await this.usermodel.findOne({ where: { email } });
            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    };

    async findUserById(id){
        try {
            const user = await this.usermodel.findByPk(id);
            return user;
        } catch(error) {
            console.error('Error finding user by ID:', error);
            return null;
        }
    };

    async findByPhone(phone){
        try {
            const user = await this.usermodel.findOne({ where: { phone } });
            return user;
        } catch (error) {
            console.error('Error finding user by phone:', error);
            return null;
        }
    };

    async findUserByRole(role){
        try {
            const user = await this.usermodel.findAll({ where: { role } });
            return user;
        } catch (error) {
            console.error('Error finding user by role:', error);
            return null;
        }
    };

    async findAllUsers(){
        try {
            const users = await this.usermodel.findAll();
            return users;
        } catch (error) {
            console.error(`Error with getting all users: ${error}`);
            return null;
        }
    }

    async updateUser(id, updatedData){
        try {
            const updatedUser = await this.usermodel.update(updatedData, { where: { id }, returning: true });
            return updatedUser
        } catch(error){
            console.error('Error updating user:', error);
            return null;
        }
    };

    async deleteUser(id){
        try {
            await this.usermodel.destroy({ where: { id } });
            return true;
        } catch(error){
            console.error('Error deleting user:', error);
            return null;
        }
    };
};

export default AuthRepository;