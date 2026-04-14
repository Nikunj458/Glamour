import jwt    from 'jsonwebtoken';
import crypto from 'crypto';
import User   from '../models/User.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const sendBrevoEmail = async ({ to, toName, subject, html }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'content-type': 'application/json',
      'api-key':      process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender:      { name: 'Glamour Boutique', email: 'glamourboutique013@gmail.com' },
      to:          [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Brevo API error');
  }
};

// ── POST /api/auth/register ───────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  res.json(req.user);
};

// ── POST /api/auth/seed-admin ─────────────────────────────────────────────
export const seedAdmin = async (req, res) => {
  try {
    const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (exists) return res.json({ message: 'Admin already exists' });
    await User.create({
      name:     'Admin',
      email:    process.env.ADMIN_EMAIL    || 'admin@boutique.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role:     'admin',
    });
    res.json({ message: 'Admin seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/forgot-password ───────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ message: 'If an account exists, a reset email has been sent.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: 'Helvetica', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #FAF7F2;">
        <h1 style="font-family: Georgia, serif; font-style: italic; color: #2C2C2C; font-size: 28px; margin-bottom: 8px;">Glamour Boutique</h1>
        <p style="color: #8B6F68; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 32px;">Password Reset</p>
        <p style="color: #2C2C2C; font-size: 14px; line-height: 1.6;">Hi ${user.name},</p>
        <p style="color: #2C2C2C; font-size: 14px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to create a new password.
          This link expires in <strong>1 hour</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
            style="display: inline-block; background: #2C2C2C; color: #FAF7F2; padding: 14px 32px;
                   font-family: 'Helvetica', sans-serif; font-size: 11px; letter-spacing: 0.2em;
                   text-transform: uppercase; text-decoration: none;">
            Reset Password
          </a>
        </div>
        <p style="color: #8B6F68; font-size: 12px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email. Your password will not change.
        </p>
        <hr style="border: none; border-top: 1px solid #E8C4B8; margin: 24px 0;" />
        <p style="color: #8B6F68; font-size: 11px;">© 2026 Glamour Boutique. All rights reserved.</p>
      </div>
    `;

    try {
      await sendBrevoEmail({
        to:      user.email,
        toName:  user.name,
        subject: 'Reset your Glamour Boutique password',
        html,
      });
      res.json({ message: 'Password reset email sent. Please check your inbox.' });
    } catch (emailErr) {
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('Email send error:', emailErr.message);
      res.status(500).json({ message: 'Could not send email. Please try again later.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/reset-password/:token ─────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      message: 'Password reset successful!',
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
