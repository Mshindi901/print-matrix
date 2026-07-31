import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

export default async function authentication (req, res, next) {
    try {
        const auth = req.headers.authorization;
        if(!auth){
            return res.status(401).json({success:false,message:'Unauthorized'})
        };
        const token = auth.split(" ")[1];
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({success:false,message:'Invalid Token',error:error})
    }
};