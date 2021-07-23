# Admin dashboard app

This is a next.js app.

## Environmental variables required:

Declare an `.env.local` file with the following variables:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID="..."
NEXT_PUBLIC_APPLE_CLIENT_ID="..."
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api/v1"
```

## Running
To run the next.js app, use the following command from the monorepo root:

`yarn package:admin`

## Generate self-signed certificate (Apple/Google login)
For Apple sign in testing, the redirect_uri must be https, and cannot be localhost. 
1. Setup hosts file to point 127.0.0.1 to fitlinkapp.test
2. Generate the certificate using `yarn ssl:generate`
3. Run `yarn package:admin:ssl` to run the dashboard with the local self-signed certificate.
4. The app will be available at https://fitlinkapp.test:4000
