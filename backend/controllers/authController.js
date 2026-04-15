const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      bio: user.bio,
    }
  });
};

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    // Prevent self-assigning admin
    const assignedRole = role === 'admin' ? 'user' : (role || 'user');
    const user = await User.create({ name, email, password, role: assignedRole, phone });

    await sendEmail({
      to: email,
      subject: 'Welcome to Eventify! 🎉',
      html: `<h2>Welcome, ${name}!</h2><p>Your account has been created successfully.</p>`
    });

    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });

    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'title date location images price');
  res.json({ success: true, user });
};

// @route PUT /api/auth/updateprofile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;
    const update = { name, phone, bio };
    if (avatar) update.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @route PUT /api/auth/changepassword
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// @route POST /api/auth/wishlist/:eventId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.eventId;
    const idx = user.wishlist.indexOf(eventId);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(eventId);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
  } catch (err) { next(err); }
};
