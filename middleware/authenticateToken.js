import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.token ||
        (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "Server configuration error" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded JWT:', decoded); // Debug log
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};
