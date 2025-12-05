import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'sonner';

const GoogleLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const login = useGoogleLogin({
    onSuccess: (codeResp) => {
      console.log("Google Sign-In Success:", codeResp);
      // Get user profile information
      GetUserProfile({ access_token: codeResp.access_token });
    },
    onError: (error) => {
      console.log("Google Sign-In Error:", error);
      toast.error("Google Sign-In failed. Please try again.");
    },
    scope: 'openid profile email',
    prompt: 'select_account',
    // Add popup configuration to handle COOP issues
    ux_mode: 'popup',
    redirect_uri: window.location.origin
  });
  
  const handleSignInClick = () => {
    // Show confirmation popup before proceeding
    setShowConfirmation(true);
  };
  
  const confirmSignIn = () => {
    // Hide confirmation and proceed with login
    setShowConfirmation(false);
    login();
  };
  
  const cancelSignIn = () => {
    // Hide confirmation and stay on modal
    setShowConfirmation(false);
  };
  
  const GetUserProfile = (tokenInfo) => {
    console.log("Access Token Info:", tokenInfo);
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'Application/json'
      }
    })
      .then((resp) => {
        console.log("Full User Profile Response:", resp);
        console.log("User Data:", resp.data);
        
        // Format user data to match the expected structure
        const formattedUserData = {
          success: true,
          _id: resp.data.id || 'google-user',
          fullname: resp.data.name || 'Google User',
          username: resp.data.email?.split('@')[0] || 'google_user',
          email: resp.data.email || '',
          gender: 'not specified',
          profilepic: resp.data.picture || 'https://avatar.iran.liara.run/public/boy?username=google',
          message: "Successfully Logged In"
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(formattedUserData));
        console.log("User data stored in localStorage:", formattedUserData);
        
        // Dispatch event to notify other components about the login
        window.dispatchEvent(new CustomEvent('user-status-changed'));
        
        // Call the success callback if provided
        if (onLoginSuccess) {
          onLoginSuccess(formattedUserData);
        }
        
        // Close the login modal
        onClose();
        
        // Show success message
        toast.success("Successfully logged in!");
      })
      .catch(error => {
        console.log("Error fetching user profile:", error);
        toast.error("Failed to fetch user profile. Please try again.");
      });
  };

  if (!isOpen) return null;

  // Render confirmation popup if needed
  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800 text-white font-sans px-4 fixed inset-0 z-50">
        
        {/* WRAPPER FOR BOTH PANELS */}
        <div className="flex flex-col md:flex-row gap-6 max-w-5xl w-full justify-center items-stretch">

          {/* LEFT PANEL */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8 w-full md:w-1/2 flex flex-col justify-between">
            
            <div>
              <h1 className="text-3xl font-bold mb-2">TravelEase</h1>

              <p className="text-gray-200 mb-8">
                Explore. Book. Travel — all in one place.
              </p>

              <p className="text-gray-300 mb-3">Quick actions</p>

              {/* Explore Destinations Button */}
              <button className="w-full border border-white/40 text-white rounded-lg py-2 mb-3 hover:bg-white/10 shadow-md shadow-purple-900/30 transition">
                Explore Destinations
              </button>

              {/* Special Offers Button */}
              <button
                className="w-full bg-white/5 text-gray-300 rounded-lg py-2 cursor-not-allowed"
                onClick={cancelSignIn}
              >
                Special Offers
              </button>
            </div>

            <p className="text-gray-300 mt-6">Secure • Fast • Friendly</p>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8 w-full md:w-1/2">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Sign in to TravelEase</h2>
              <button 
                onClick={cancelSignIn}
                className="text-blue-300 hover:text-blue-400 text-sm"
              >
                Cancel
              </button>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="font-bold text-lg mb-2">🔒 Secure Authentication</h3>
              <p className="text-gray-200 text-sm">
                You will be redirected to Google to securely authenticate your account. 
                We only request basic profile information to personalize your experience.
              </p>
            </div>

            {/* Google Button */}
            <button 
              onClick={confirmSignIn}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-full shadow-lg shadow-blue-900/40 transition"
            >
              <FcGoogle className="w-5 h-5" />
              Continue with Google
            </button>

          </div>

        </div>

        {/* FOOTER */}
        <div className="absolute bottom-4 text-gray-300 text-sm">
          © 2025 TravelEase — Built with ❤️
        </div>
      </div>
    );
  }

  // Render main login modal
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800 text-white font-sans px-4 fixed inset-0 z-50">
      
      {/* WRAPPER FOR BOTH PANELS */}
      <div className="flex flex-col md:flex-row gap-6 max-w-5xl w-full justify-center items-stretch">

        {/* LEFT PANEL */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8 w-full md:w-1/2 flex flex-col justify-between">
          
          <div>
            <h1 className="text-3xl font-bold mb-2">TravelEase</h1>

            <p className="text-gray-200 mb-8">
              Explore. Book. Travel — all in one place.
            </p>

            <p className="text-gray-300 mb-3">Quick actions</p>

            {/* Explore Destinations Button */}
            <button className="w-full border border-white/40 text-white rounded-lg py-2 mb-3 hover:bg-white/10 shadow-md shadow-purple-900/30 transition">
              Explore Destinations
            </button>

            {/* Special Offers Button */}
            <button
              className="w-full bg-white/5 text-gray-300 rounded-lg py-2 cursor-not-allowed"
              onClick={() => alert('Coming soon')}
            >
              Special Offers
            </button>
          </div>

          <p className="text-gray-300 mt-6">Secure • Fast • Friendly</p>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8 w-full md:w-1/2">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Sign in to TravelEase</h2>
            <button 
              onClick={onClose}
              className="text-blue-300 hover:text-blue-400 text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Google Button */}
          <button 
            onClick={handleSignInClick}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-full shadow-lg shadow-blue-900/40 transition"
          >
            <FcGoogle className="w-5 h-5" />
            Sign in with Google
          </button>

        </div>

      </div>

      {/* FOOTER */}
      <div className="absolute bottom-4 text-gray-300 text-sm">
        © 2025 TravelEase — Built with ❤️
      </div>
    </div>
  );
};

export default GoogleLoginModal;