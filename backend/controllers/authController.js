const User = require('../models/User');

/**
 * Register new user
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name, profile } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        ok: false,
        error: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      profile: profile || {}
    });

    await user.save();

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Return user data without sensitive info
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    res.status(201).json({
      ok: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: '15m'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      ok: false,
      error: 'Registration failed',
      details: error.message
    });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Email and password are required'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        ok: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        ok: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token and update last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Return user data without sensitive info
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    res.json({
      ok: true,
      message: 'Login successful',
      data: {
        user: userData,
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: '15m'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      ok: false,
      error: 'Login failed',
      details: error.message
    });
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res) => {
  try {
    // User is already verified by verifyRefreshToken middleware
    const user = req.user;

    // Generate new access token
    const accessToken = user.generateAccessToken();

    res.json({
      ok: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: '15m'
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      ok: false,
      error: 'Token refresh failed',
      details: error.message
    });
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res) => {
  try {
    const user = req.user;

    // Clear refresh token
    user.refreshToken = undefined;
    await user.save();

    res.json({
      ok: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      ok: false,
      error: 'Logout failed',
      details: error.message
    });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      ok: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch profile',
      details: error.message
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;

    // Fields that can be updated
    const allowedUpdates = ['name', 'profile', 'settings'];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'profile' || field === 'settings') {
          user[field] = { ...user[field], ...updates[field] };
        } else {
          user[field] = updates[field];
        }
      }
    });

    await user.save();

    res.json({
      ok: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to update profile',
      details: error.message
    });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        ok: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.userId).select('+password');
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        ok: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      ok: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to change password',
      details: error.message
    });
  }
};
