import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchTrips } from '@/hooks/useFetchTrips';

const SocialFeatures = () => {
  const navigate = useNavigate();
  const { allTrips } = useFetchTrips();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());

  // Mock social data for demonstration
  const mockUsers = [
    { id: 1, name: 'Alex Johnson', avatar: 'https://avatar.iran.liara.run/public/boy?username=alex' },
    { id: 2, name: 'Maria Garcia', avatar: 'https://avatar.iran.liara.run/public/girl?username=maria' },
    { id: 3, name: 'Sam Wilson', avatar: 'https://avatar.iran.liara.run/public/boy?username=sam' },
    { id: 4, name: 'Emma Thompson', avatar: 'https://avatar.iran.liara.run/public/girl?username=emma' },
    { id: 5, name: 'James Brown', avatar: 'https://avatar.iran.liara.run/public/boy?username=james' },
  ];

  // Initialize mock posts
  useEffect(() => {
    if (allTrips && allTrips.length > 0) {
      const mockPosts = allTrips.slice(0, 5).map((trip, index) => ({
        id: trip._id,
        user: mockUsers[index % mockUsers.length],
        trip: trip,
        content: `Just planned an amazing trip to ${trip.userSelection.location.label}! Can't wait to explore this beautiful destination. Who else has been here?`,
        timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 50) + 5,
        comments: Math.floor(Math.random() * 20) + 1,
      }));
      
      setPosts(mockPosts);
      
      // Initialize comments for each post
      const initialComments = {};
      mockPosts.forEach(post => {
        initialComments[post.id] = [
          {
            id: 1,
            user: mockUsers[(mockUsers.findIndex(u => u.id === post.user.id) + 1) % mockUsers.length],
            content: 'Looks amazing! Would love to join you on this trip.',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            user: mockUsers[(mockUsers.findIndex(u => u.id === post.user.id) + 2) % mockUsers.length],
            content: 'Great choice of destination! Have a wonderful time!',
            timestamp: new Date(Date.now() - 1800000).toISOString()
          }
        ];
      });
      setComments(initialComments);
    }
  }, [allTrips]);

  // Handle like/unlike
  const handleLike = (postId) => {
    if (likedPosts.has(postId)) {
      // Unlike
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes - 1 } 
          : post
      ));
    } else {
      // Like
      setLikedPosts(prev => new Set([...prev, postId]));
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 } 
          : post
      ));
    }
  };

  // Handle adding a comment
  const handleAddComment = (postId) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      user: mockUsers[0], // Current user
      content: newComment,
      timestamp: new Date().toISOString()
    };
    
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }));
    
    setNewComment('');
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Get budget label
  const getBudgetLabel = (budgetId) => {
    const budgets = ['Cheap', 'Moderate', 'Luxury'];
    return budgets[budgetId - 1] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Travel Community</h1>
          <p className="text-gray-600">Connect with fellow travelers and share your experiences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'feed'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Activity Feed
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'following'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Following
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'trending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Trending
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={post.user.avatar} 
                        alt={post.user.name} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-800">{post.user.name}</h3>
                        <p className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Post Content */}
                  <div className="mt-4">
                    <p className="text-gray-700">{post.content}</p>
                  </div>
                  
                  {/* Trip Preview */}
                  <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div className="ml-4">
                        <h4 className="font-bold text-gray-800">{post.trip.userSelection.location.label}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {post.trip.userSelection.days} days
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {getBudgetLabel(post.trip.userSelection.budget)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Post Actions */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-1 ${
                          likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments + (comments[post.id] ? comments[post.id].length : 0)}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                    <button 
                      onClick={() => navigate(`/trip-details/${post.trip._id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Trip
                    </button>
                  </div>
                </div>
                
                {/* Comments Section */}
                <div className="p-6 pt-0">
                  {/* Existing Comments */}
                  {comments[post.id] && comments[post.id].map((comment) => (
                    <div key={comment.id} className="flex mt-4">
                      <img 
                        src={comment.user.avatar} 
                        alt={comment.user.name} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="ml-3 flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center">
                            <span className="font-medium text-sm text-gray-800">{comment.user.name}</span>
                            <span className="text-xs text-gray-500 ml-2">{formatTimestamp(comment.timestamp)}</span>
                          </div>
                          <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Comment */}
                  <div className="flex mt-4">
                    <img 
                      src={mockUsers[0].avatar} 
                      alt="Your avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="ml-3 flex-1 flex">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Following</h2>
            <p className="text-gray-600 mb-6">
              Follow other travelers to see their trips and activities in your feed.
            </p>
            <button
              onClick={() => setActiveTab('feed')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Browse Activity Feed
            </button>
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Trending Destinations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { destination: 'Bali, Indonesia', trips: 124, image: '🏝️' },
                { destination: 'Paris, France', trips: 98, image: '🗼' },
                { destination: 'Tokyo, Japan', trips: 87, image: '🇯🇵' },
                { destination: 'New York, USA', trips: 76, image: '🗽' },
              ].map((item, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl mr-4">{item.image}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.destination}</h3>
                    <p className="text-gray-600">{item.trips} trips planned</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Explore
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Popular Travelers</h3>
              <div className="space-y-4">
                {mockUsers.slice(0, 3).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <h4 className="font-bold text-gray-800">{user.name}</h4>
                        <p className="text-gray-600">Active traveler</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{(index + 1) * 42} trips</div>
                      <button className="mt-1 text-blue-600 hover:text-blue-800 text-sm">
                        Follow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!allTrips || allTrips.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips found</h3>
            <p className="text-gray-600 mb-6">Create some trips to see social activity!</p>
            <button
              onClick={() => navigate('/create-trip')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Create New Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeatures;