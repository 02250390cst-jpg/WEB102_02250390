// Simple in-memory mock data for prototyping
const users = [
  {
    id: '1',
    username: 'alice',
    email: 'alice@example.com',
    full_name: 'Alice Johnson',
    profile_picture: 'https://i.pravatar.cc/150?img=1',
    bio: 'Coffee lover and API builder',
    created_at: '2025-09-01'
  },
  {
    id: '2',
    username: 'bob',
    email: 'bob@example.com',
    full_name: 'Bob Smith',
    profile_picture: 'https://i.pravatar.cc/150?img=2',
    bio: 'Front-end wizard',
    created_at: '2025-09-02'
  },
  {
    id: '3',
    username: 'carol',
    email: 'carol@example.com',
    full_name: 'Carol Johnson',
    profile_picture: 'https://i.pravatar.cc/150?img=3',
    bio: 'Full-stack developer',
    created_at: '2025-09-03'
  }
];

const posts = [
  {
    id: '1',
    user_id: '1',
    title: 'Hello World',
    body: 'This is my first post! Happy to be here.',
    created_at: '2026-03-01'
  },
  {
    id: '2',
    user_id: '2',
    title: 'Node.js Tips',
    body: 'Share your favorite Node tips in the comments.',
    created_at: '2026-03-05'
  },
  {
    id: '3',
    user_id: '1',
    title: 'API Design',
    body: 'Good API design is all about consistency and simplicity.',
    created_at: '2026-03-09'
  }
];

const comments = [
  {
    id: '1',
    post_id: '1',
    user_id: '2',
    body: 'Great first post!',
    created_at: '2026-03-02'
  },
  {
    id: '2',
    post_id: '1',
    user_id: '3',
    body: 'Welcome to the platform!',
    created_at: '2026-03-03'
  }
];

const likes = [
  { id: '1', post_id: '1', user_id: '2', created_at: '2026-03-02' },
  { id: '2', post_id: '1', user_id: '3', created_at: '2026-03-03' }
];

const followers = [
  { id: '1', user_id: '1', follower_id: '2', created_at: '2026-03-02' },
  { id: '2', user_id: '1', follower_id: '3', created_at: '2026-03-03' }
];

module.exports = {
  users,
  posts,
  comments,
  likes,
  followers
};
