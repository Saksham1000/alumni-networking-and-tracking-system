import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import PostCard from '../components/PostCard';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/users/feed/');
        setPosts(res.data);
      } catch (err) {
        let msg = 'Failed to fetch feed';
        if (err.response) {
          if (typeof err.response.data === 'string' && err.response.data.startsWith('<')) {
            msg += ': Server error or permission denied.';
          } else if (typeof err.response.data === 'object') {
            msg += ': ' + (err.response.data.detail || JSON.stringify(err.response.data));
          }
        } else if (err.message) {
          msg += ': ' + err.message;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && posts.length === 0 && <div>No posts found.</div>}
      {!loading && !error && posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default FeedPage; 