const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { users } = require('../utils/mockData');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = users.length;

  const results = users.slice(startIndex, endIndex);

  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: results.length,
    page,
    total_pages: Math.ceil(total / limit),
    pagination,
    data: results
  });
});

// @desc    Get single user by id
// @route   GET /api/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create new user
// @route   POST /api/users
// @access  Public
exports.createUser = asyncHandler(async (req, res, next) => {
  const { username, email, full_name, profile_picture, bio } = req.body;

  // Basic validation
  if (!username || !email) {
    return next(new ErrorResponse('Please provide username and email', 400));
  }

  // Ensure username is unique
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return next(new ErrorResponse('Username already exists', 400));
  }

  const newUser = {
    id: (users.length + 1).toString(),
    username,
    email,
    full_name: full_name || '',
    profile_picture: profile_picture || 'default-profile.jpg',
    bio: bio || '',
    created_at: new Date().toISOString().slice(0, 10)
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser
  });
});

// @desc    Update user by id
// @route   PUT /api/users/:id
// @access  Public
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userIndex = users.findIndex((u) => u.id === req.params.id);
  if (userIndex === -1) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  const updatedUser = {
    ...users[userIndex],
    ...req.body,
    id: users[userIndex].id
  };

  users[userIndex] = updatedUser;

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// @desc    Delete user by id
// @route   DELETE /api/users/:id
// @access  Public
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const userIndex = users.findIndex((u) => u.id === req.params.id);
  if (userIndex === -1) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  users.splice(userIndex, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});
