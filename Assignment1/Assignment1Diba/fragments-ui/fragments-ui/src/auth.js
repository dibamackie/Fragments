// src/auth.js

import { UserManager } from 'https://cdn.skypack.dev/oidc-client-ts';

async function fetchConfig() {
  const response = await fetch('/config');
  return await response.json();
}

const config = await fetchConfig();

// Determine if Cognito is properly configured
const hasCognitoConfig =
  config.AWS_COGNITO_POOL_ID?.trim() &&
  config.AWS_COGNITO_CLIENT_ID?.trim() &&
  !config.HTPASSWD_FILE;  // Prevent conflict

if (config.AWS_COGNITO_POOL_ID && config.AWS_COGNITO_CLIENT_ID && config.HTPASSWD_FILE) {
  console.error('❌ Both AWS Cognito and HTTP Basic Auth (HTPASSWD_FILE) cannot be configured at the same time.');
}

let userManager = null;

// Only initialize Cognito if it’s the only configured option
if (hasCognitoConfig) {
  const cognitoAuthConfig = {
    authority: `https://cognito-idp.us-east-1.amazonaws.com/${config.AWS_COGNITO_POOL_ID}`,
    client_id: config.AWS_COGNITO_CLIENT_ID,
    redirect_uri: config.OAUTH_SIGN_IN_REDIRECT_URL,
    response_type: 'code',
    scope: 'phone openid email',
    revokeTokenTypes: ['refresh_token'],
    automaticSilentRenew: false,
  };

  userManager = new UserManager(cognitoAuthConfig);
}

// Trigger Cognito sign-in if configured
export async function signIn() {
  if (!userManager) {
    console.warn('Cognito not configured. Skipping sign-in.');
    return;
  }

  await userManager.signinRedirect();
}

// Simplified user object with header builder
function formatUser(user) {
  console.log('User Authenticated', { user });

  const isLocal = window.location.hostname === 'localhost' && config.HTPASSWD_FILE;

  return {
    username: user?.profile?.['cognito:username'],
    email: user?.profile?.email,
    idToken: user?.id_token,
    accessToken: user?.access_token,

    authorizationHeaders: () => {
      if (isLocal) {
        const username = 'user1@email.com';   // Replace with dynamic input
        const password = 'password1';         // Replace with dynamic input
        const base64Auth = btoa(`${username}:${password}`);

        return {
          Authorization: `Basic ${base64Auth}`,
        };
      } else {
        return {
          Authorization: `Bearer ${user.id_token}`,
        };
      }
    },
  };
}

// Determine if user is signed in (Cognito) or null
export async function getUser() {
  const isLocal = window.location.hostname === 'localhost' && config.HTPASSWD_FILE;

  if (!userManager && isLocal) {
    console.log('🔐 Basic Auth mode: attempting auto-login');

    // Hardcoded credentials for local development
    const username = 'user1@email.com';
    const password = 'password1';
    const base64Auth = btoa(`${username}:${password}`);

    const headers = {
      Authorization: `Basic ${base64Auth}`,
    };

    try {
      const res = await fetch(`${config.API_URL}/v1/fragments`, {
        headers,
      });

      if (!res.ok) {
        console.warn('❌ Basic Auth failed with status', res.status);
        return null;
      }

      return {
        username,
        authorizationHeaders: () => headers,
      };
    } catch (err) {
      console.error('❌ Error during Basic Auth login', err);
      return null;
    }
  }

  // Default Cognito flow
  if (window.location.search.includes('code=')) {
    const user = await userManager.signinCallback();
    window.history.replaceState({}, document.title, window.location.pathname);
    return formatUser(user);
  }

  const user = await userManager?.getUser?.();
  return user ? formatUser(user) : null;
}
