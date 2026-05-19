// Mock users data
const users = [
  {
    id: '1',
    username: 'traveler',
    full_name: 'Karma',
    email: 'traveler@example.com',
    profile_picture: 'https://example.com/profiles/traveler.jpg',
    bio: 'Travel photographer',
    created_at: '2023-01-15'
  },
  {
    id: '2',
    username: 'foodie',
    full_name: 'Sonam Tashi',
    email: 'foodie@example.com',
    profile_picture: 'https://example.com/profiles/foodie.jpg',
    bio: 'Food enthusiast',
    created_at: '2023-01-20'
  },
  {
    id: '3',
    username: 'techgeek',
    full_name: 'Tenzin Dorji',
    email: 'techgeek@example.com',
    profile_picture: 'https://example.com/profiles/techgeek.jpg',
    bio: 'Tech lover',
    created_at: '2023-01-25'
  }
];

// Mock posts data
const posts = [
  {
    id: '1',
    caption: 'Beautiful sunset at the beach!',
    image: 'https://example.com/posts/beach.jpg',
    user_id: '1',
    created_at: '2023-02-15'
  },
  {
    id: '2',
    caption: 'Delicious pasta for dinner',
    image: 'https://example.com/posts/pasta.jpg',
    user_id: '2',
    created_at: '2023-02-20'
  },
  {
    id: '3',
    caption: 'New gadget unboxing',
    image: 'https://example.com/posts/gadget.jpg',
    user_id: '3',
    created_at: '2023-02-25'
  }
];

// Mock comments data
const comments = [
  {
    id: '1',
    text: 'Looks amazing!',
    user_id: '2',
    post_id: '1',
    created_at: '2023-02-16'
  },
  {
    id: '2',
    text: 'Love the view!',
    user_id: '3',
    post_id: '1',
    created_at: '2023-02-17'
  },
  {
    id: '3',
    text: 'That looks delicious!',
    user_id: '1',
    post_id: '2',
    created_at: '2023-02-21'
  }
];

// Mock likes data
const likes = [
  {
    id: '1',
    user_id: '2',
    post_id: '1',
    created_at: '2023-02-16'
  },
  {
    id: '2',
    user_id: '3',
    post_id: '1',
    created_at: '2023-02-17'
  },
  {
    id: '3',
    user_id: '1',
    post_id: '2',
    created_at: '2023-02-21'
  }
];

// Mock followers data
const followers = [
  {
    id: '1',
    follower_id: '2',
    following_id: '1',
    created_at: '2023-02-16'
  },
  {
    id: '2',
    follower_id: '3',
    following_id: '1',
    created_at: '2023-02-17'
  },
  {
    id: '3',
    follower_id: '1',
    following_id: '2',
    created_at: '2023-02-21'
  }
];

module.exports = {
  users,
  posts,
  comments,
  likes,
  followers
};