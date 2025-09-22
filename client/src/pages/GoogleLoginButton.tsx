import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // 1. Get user info from Google
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const data = await res.json();

        // 2. Prepare userData to send to your backend
        const userData = {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          googleId: data.sub,
          profileImageUrl: data.picture,
        };

        // 3. Send to your backend API route
        const backendRes = await fetch('/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        const backendData = await backendRes.json();

        console.log('Logged in user from DB:', backendData.user);

        // 4. Redirect or store user info locally
        window.location.href = '/';
      } catch (err) {
        console.error('Google login failed', err);
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => console.error(errorResponse),
  });

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => googleLogin()}
        disabled={loading}
        style={{
          background: '#4285F4',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          cursor: 'pointer',
          borderRadius: '5px',
        }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  );
}