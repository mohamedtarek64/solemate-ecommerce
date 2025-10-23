/**
 * OAuth helper functions
 */

/**
 * OAuth provider configurations
 */
export const OAUTH_PROVIDERS = {
  google: {
    name: 'Google',
    icon: 'google',
    color: '#4285F4',
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    hoverColor: 'hover:bg-gray-50'
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    hoverColor: 'hover:bg-blue-700'
  },
  apple: {
    name: 'Apple',
    icon: 'apple',
    color: '#000000',
    bgColor: 'bg-black',
    textColor: 'text-white',
    borderColor: 'border-black',
    hoverColor: 'hover:bg-gray-900'
  },
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    bgColor: 'bg-sky-500',
    textColor: 'text-white',
    borderColor: 'border-sky-500',
    hoverColor: 'hover:bg-sky-600'
  },
  github: {
    name: 'GitHub',
    icon: 'github',
    color: '#333333',
    bgColor: 'bg-gray-800',
    textColor: 'text-white',
    borderColor: 'border-gray-800',
    hoverColor: 'hover:bg-gray-900'
  }
};

/**
 * Get provider configuration
 */
export const getProviderConfig = (provider) => {
  return OAUTH_PROVIDERS[provider] || null;
};

/**
 * Get all available providers
 */
export const getAvailableProviders = () => {
  return Object.keys(OAUTH_PROVIDERS).filter(provider => {
    const clientId = getProviderClientId(provider);
    return clientId && clientId.trim() !== '';
  });
};

/**
 * Get provider client ID from environment
 */
export const getProviderClientId = (provider) => {
  const envVar = `VITE_${provider.toUpperCase()}_CLIENT_ID`;
  return import.meta.env[envVar];
};

/**
 * Check if provider is configured
 */
export const isProviderConfigured = (provider) => {
  const clientId = getProviderClientId(provider);
  return clientId && clientId.trim() !== '';
};

/**
 * Generate OAuth state parameter
 */
export const generateOAuthState = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate OAuth state parameter
 */
export const validateOAuthState = (receivedState, storedState) => {
  return receivedState === storedState;
};

/**
 * Get OAuth authorization URL
 */
export const getOAuthUrl = (provider, options = {}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const state = generateOAuthState();

  // Store state for CSRF protection
  localStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    client_id: getProviderClientId(provider),
    redirect_uri: options.redirectUri || getRedirectUri(provider),
    response_type: 'code',
    scope: getProviderScope(provider),
    state: state,
    ...options.extraParams
  });

  return `${baseUrl}/auth/${provider}?${params.toString()}`;
};

/**
 * Get OAuth redirect URI
 */
export const getRedirectUri = (provider) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/auth/oauth/callback/${provider}`;
};

/**
 * Get OAuth scope for provider
 */
export const getProviderScope = (provider) => {
  const scopes = {
    google: 'openid email profile',
    facebook: 'email',
    apple: 'name email',
    twitter: 'tweet.read users.read',
    github: 'user:email'
  };

  return scopes[provider] || 'email';
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = async (provider, code, state) => {
  // Validate state parameter
  const storedState = localStorage.getItem('oauth_state');
  if (!validateOAuthState(state, storedState)) {
    throw new Error('Invalid state parameter');
  }

  // Clear stored state
  localStorage.removeItem('oauth_state');

  // Exchange code for token
  const response = await fetch('/api/auth/oauth/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      code,
      state
    })
  });

  if (!response.ok) {
    throw new Error('OAuth authentication failed');
  }

  return response.json();
};

/**
 * Get provider icon SVG
 */
export const getProviderIcon = (provider) => {
  const icons = {
    google: `
      <svg viewBox="0 0 24 24" class="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    `,
    facebook: `
      <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    `,
    apple: `
      <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    `,
    twitter: `
      <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    `,
    github: `
      <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    `
  };

  return icons[provider] || '';
};

/**
 * Check if OAuth is supported
 */
export const isOAuthSupported = () => {
  return typeof window !== 'undefined' && 'crypto' in window;
};

/**
 * Get OAuth error message
 */
export const getOAuthErrorMessage = (error) => {
  const errorMessages = {
    access_denied: 'Access was denied. Please try again.',
    invalid_request: 'Invalid request. Please try again.',
    unauthorized_client: 'Unauthorized client. Please contact support.',
    unsupported_response_type: 'Unsupported response type.',
    invalid_scope: 'Invalid scope requested.',
    server_error: 'Server error. Please try again later.',
    temporarily_unavailable: 'Service temporarily unavailable. Please try again later.'
  };

  return errorMessages[error] || 'OAuth authentication failed. Please try again.';
};
