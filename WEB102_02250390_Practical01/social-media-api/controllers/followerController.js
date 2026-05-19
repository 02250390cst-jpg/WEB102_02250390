const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { followers, users } = require('../utils/mockData');

// @desc    Get all followers
// @route   GET /api/followers
// @access  Public
exports.getFollowers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = followers.length;

  const results = followers.slice(startIndex, endIndex);

  const enhancedResults = results.map((follow) => {
    const user = users.find((u) => u.id === follow.user_id);
    const follower = users.find((u) => u.id === follow.follower_id);
    return {
      ...follow,
      user: user ? { id: user.id, username: user.username } : null,
      follower: follower ? { id: follower.id, username: follower.username } : null
    };
  });

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: enhancedResults.length,
    page,
    total_pages: Math.ceil(total / limit),
    pagination,
    data: enhancedResults
  });
});

// @desc    Get single follower record
// @route   GET /api/followers/:id
// @access  Public
exports.getFollower = asyncHandler(async (req, res, next) => {
  const follow = followers.find((f) => f.id === req.params.id);
  if (!follow) {
    return next(new ErrorResponse(`Follow record not found with id of ${req.params.id}`, 404));
  }

  const user = users.find((u) => u.id === follow.user_id);
  const follower = users.find((u) => u.id === follow.follower_id);

  res.status(200).json({
    success: true,
    data: {
      ...follow,
      user: user ? { id: user.id, username: user.username } : null,
      follower: follower ? { id: follower.id, username: follower.username } : null
    }
  });
});

// @desc    Create a follow relationship
// @route   POST /api/followers
// @access  Private (simulated via X-User-Id)
exports.createFollower = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const { user_id } = req.body;
  if (!user_id) {
    return next(new ErrorResponse('Please provide user_id to follow', 400));
  }

  if (user_id === userId) {
    return next(new ErrorResponse('Cannot follow yourself', 400));
  }

  const user = users.find((u) => u.id === user_id);
  if (!user) {
    return next(new ErrorResponse('User to follow not found', 404));
  }

  const existing = followers.find((f) => f.user_id === user_id && f.follower_id === userId);
  if (existing) {
    return next(new ErrorResponse('Already following this user', 400));
  }

  const newFollow = {
    id: (followers.length + 1).toString(),
    user_id,
    follower_id: userId,
    created_at: new Date().toISOString().slice(0, 10)
  };

  followers.push(newFollow);

  res.status(201).json({
    success: true,
    data: newFollow
  });
});

// @desc    Unfollow a user
// @route   DELETE /api/followers/:id
// @access  Private (simulated via X-User-Id)
exports.deleteFollower = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const index = followers.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    return next(new ErrorResponse(`Follow record not found with id of ${req.params.id}`, 404));
  }

  if (followers[index].follower_id !== userId) {
    return next(new ErrorResponse('Not authorized to delete this follow record', 403));
  }

  followers.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});
