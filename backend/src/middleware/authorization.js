export default function authorization(...allowedRoles) {
    return (req, res, next) => {
        try {
            if (!allowedRoles.includes(req.user?.role)) {
                return res.status(403).json({success:false, message:'Forbidden user'});
            }

            next();
        } catch (error) {
            console.error(`Authorization failed because: ${error}`);
            return res.status(500).json({success:false, message:'Authorization failed'});
        }
    };
}