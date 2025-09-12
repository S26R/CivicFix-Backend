// controllers/dashboard.controller.js
import User from '../models/user.model.js';
import Grievance from '../models/grievance.model.js'; // Assuming you have a grievance model

export const getCitizenDashboardData = async (req, res) => {
    try {
        // The user ID is available from the JWT payload set by the middleware
        const userId = req.user.id;

        // Fetch user-specific data from the database
        const user = await User.findById(userId).select('-password'); // Exclude password
        const grievances = await Grievance.find({ userId: userId });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            user: user,
            grievances: grievances
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};


