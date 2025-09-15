# Fragments UI

A simple single-page web app for testing the [Fragments API](../fragments).  
This UI uses **AWS Cognito Hosted UI** with **oidc-client-ts** to handle login/logout and fetch user fragments.

## Features
- **Login with AWS Cognito** using Authorization Code Flow
- **Logout** via Cognito Hosted UI
- **Display welcome message** for authenticated users
- **Fetch and list user fragments** from the Fragments API backend


## Requirements
- Node.js v20+
- An AWS Cognito **User Pool** and **App Client** with:
  - Authorization code grant enabled
  - Allowed callback/logout URLs pointing to `http://localhost:1234`
- The backend Fragments API running locally on `http://localhost:8080`

## Setup
1. Clone this repo and install dependencies:
   ```bash
   npm install
## Create a .env file in the project root:
API_URL=http://localhost:8080
AWS_COGNITO_POOL_ID=us-east-1_xxxxxxx
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxx
AWS_COGNITO_DOMAIN=your-domain-prefix
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
''' 

##Start the app:
npm start
