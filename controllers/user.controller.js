const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRATION = '1h';
const REFRESH_TOKEN_EXPIRATION = '7d';

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });

        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err)
    {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(400).json({ message: 'Invalid credentials' });

        const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });

        user.refreshToken = refreshToken;
        await user.save();

        res.json({ accessToken, refreshToken });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const logoutUser = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const user = await User.findOne({ refreshToken });
        if (!user)
            return res.status(400).json({ message: 'Invalid refresh token' });
        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const refreshToken = async (req, res) => {
    const { token } = req.body;

    try {
        if (!token) return res.status(403).json({ message: 'Refresh token is required' });

        const user = await User.findOne({ refreshToken: token });
        if (!user)
            return res.status(403).json({ message: 'Invalid refresh token' });

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Invalid refresh token' });

            const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
            res.json({ accessToken });
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password -refreshToken');
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id, '-password -refreshToken');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { username, email },
            { new: true, runValidators: true, select: '-password -refreshToken' } // Return updated document
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }, '-password -refreshToken');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    getAllUsers,
    getUserById,
    getUserByUsername,
    updateUser,
    deleteUser,
};