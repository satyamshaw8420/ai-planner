import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'sonner';

const GoogleLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 backdrop-blur-sm bg-white/90 border border-white/50">
        <h2 className="text-2xl font-bold mb-4">🔐 Sign in to Continue</h2>
        <p className="text-gray-600 mb-6">
          📲 Please sign in with Google to create and save your trip plans.
        </p>
        <button
          onClick={() => login()}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors backdrop-blur-sm text-lg"
        >
          <FcGoogle className="text-2xl" />
          <span>🟢 Sign in with Google</span>
        </button>
        <button
          onClick={onClose}
          className="w-full mt-4 text-gray-500 hover:text-gray-700 font-medium py-3 text-lg"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
};

export default GoogleLoginModal;