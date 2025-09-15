# Fragments UI

A simple single-page web app for testing the [Fragments API](../fragments).  
This UI uses **AWS Cognito Hosted UI** with **oidc-client-ts** to handle login/logout and fetch user fragments.

## Features
- **Login with AWS Cognito** using Authorization Code Flow
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
   cd fragment
   npm install
   npm start
   cd ..
   cd fragments-ui
   npm install
   npm start
```
## Create a .env file in the project root:
API_URL=http://localhost:8080
AWS_COGNITO_POOL_ID=us-east-1_xxxxxxx
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxx
AWS_COGNITO_DOMAIN=your-domain-prefix
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234

## Start the app:
```bash
   cd fragment
   npm start
   cd ..
   cd fragments-ui
   npm start
```

## Open http://localhost:1234 in your browser.


## Screenshots

![0-npmStartBackEnd](https://github.com/user-attachments/assets/fdc9cf03-87f9-4b40-b990-48d75e62bb54)
![1-npmStart](https://github.com/user-attachments/assets/55a0fa7a-5d02-4355-81cb-81dd577f31ce)
![2-localhost1234](https://github.com/user-attachments/assets/e0150029-c56e-4c73-8c32-cb2f4111f602)
![3-SignIn](https://github.com/user-attachments/assets/8c646ff7-b4c4-4816-85f9-f06ed951564e)
![4-Signup](https://github.com/user-attachments/assets/b7e25388-23d0-4a61-8584-bd6116235c45)
![5-LoginRedirect](https://github.com/user-attachments/assets/b350fd9e-4857-4905-bfb8-164d1fa8a55a)
![6-AWSConsoleUSERS](https://github.com/user-attachments/assets/7bdfdbab-dd82-41d9-b9fd-3a4fa0d6070f)








