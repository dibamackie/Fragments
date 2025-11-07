// src/app.js

import { signIn, getUser } from './auth.js';
import { getUserFragments } from './api.js';
import { createFragment } from './api.js';

async function init() {
  // Get our UI elements
  console.log('Initializing app...');
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const createFragmentSection = document.querySelector('#create-fragment');
  const submitFragmentBtn = document.querySelector('#submit-fragment');
  const fragmentTextArea = document.querySelector('#fragment-text');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    console.log('Login button clicked');
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    return;
  }
    // Do an authenticated request to the fragments API server and log the result
  const userFragments = await getUserFragments(user);

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Show the Create Fragment section
  createFragmentSection.hidden = false;
  submitFragmentBtn.onclick = async () => {
    const fragmentText = fragmentTextArea.value.trim();
    if (!fragmentText) {
      alert("Fragment cannot be empty!");
      return;
    }

    // Create the fragment by sending a request to the API
    try {
      const createdFragment = await createFragment(user, fragmentText);
      console.log('Created Fragment:', createdFragment);
      // Optionally, update the UI with the new fragment
      alert('Fragment created successfully!');
      fragmentTextArea.value = '';  // Clear input after successful creation
    } catch (err) {
      console.error('Error creating fragment:', err);
      alert('Failed to create fragment.');
    }
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
init();