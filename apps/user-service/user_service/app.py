# backend/main.py
import firebase_admin
from firebase_admin import credentials, auth
import os
import json
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr # Pydantic for data validation

# For Rate Limiting
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from redis.asyncio import Redis as Aioredis # Use async Redis client for fastapi-limiter

# Load environment variables from .env file
load_dotenv()

# --- Firebase Admin SDK Initialization ---
try:
    service_account_info_str = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
    if service_account_info_str:
        # Load credentials from the environment variable string
        service_account_info = json.loads(service_account_info_str)
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully via environment variable.")
    else:
        # Fallback to default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS)
        # This is useful if deploying to Google Cloud services like Cloud Run
        firebase_admin.initialize_app()
        print("Firebase Admin SDK initialized successfully via GOOGLE_APPLICATION_CREDENTIALS or default discovery.")
except Exception as e:
    print(f"CRITICAL ERROR: Could not initialize Firebase Admin SDK. Please check your FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS. Error: {e}")
    # In a real production app, you might want to raise this error to prevent the app from starting
    # raise RuntimeError("Failed to initialize Firebase Admin SDK.")

app = FastAPI()

# --- CORS Configuration ---
# Ensure your Next.js frontend can communicate with FastAPI
origins = [
    "http://localhost:3000",  # Your Next.js development server
    # Add your deployed Next.js domain here when in production, e.g., "https://your-nextjs-app.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],    # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],    # Allow all headers, including Authorization
)

# --- FastAPI Lifespan Events for Rate Limiter ---
@app.on_event("startup")
async def startup():
    """Initializes the FastAPI-Limiter on application startup."""
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
    redis = Aioredis.from_url(redis_url, encoding="utf8", decode_responses=True)
    await FastAPILimiter.init(redis)
    print(f"FastAPILimiter initialized with Redis at {redis_url}.")

@app.on_event("shutdown")
async def shutdown():
    """Shuts down the FastAPI-Limiter on application shutdown."""
    if FastAPILimiter._redis: # Check if Redis client exists
        await FastAPILimiter.shutdown()
        print("FastAPILimiter shut down.")

# --- Pydantic Models for Request Body Validation ---
# These models define the expected data structure for incoming requests.
# While FastAPI uses Pydantic, the validation logic here can correspond to your Zod schemas
# on the frontend for consistency, though Firebase Auth does the final password policy check.
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# You could define a UserSignUp model here if your backend also handles user creation
# For this setup, Next.js calls Firebase Auth directly for sign-up.
# class UserSignUp(BaseModel):
#     email: EmailStr
#     password: str
#     confirm_password: str # For backend-side password confirmation check if needed


# --- FastAPI Authentication Dependency ---
# This dependency extracts and verifies the Firebase ID token from the Authorization header.
oauth2_scheme = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme)):
    """
    Dependency to verify Firebase ID token and return decoded user information.
    This runs for any endpoint that includes `Depends(get_current_user)`.
    """
    try:
        id_token = credentials.credentials # Extract the token string
        decoded_token = auth.verify_id_token(id_token) # Verify with Firebase Admin SDK
        # Optional: You can add more checks here, e.g., to see if the token has been revoked
        # auth.check_revoked(id_token)
        return decoded_token # Return the decoded token payload (user info)
    except firebase_admin.auth.InvalidIdTokenError as e:
        # Specific error for invalid or expired Firebase ID tokens
        print(f"Invalid ID token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials or expired token.",
            headers={"WWW-Authenticate": "Bearer"}, # Required for Bearer token scheme
        )
    except Exception as e:
        # Catch other potential errors during token verification
        print(f"Token verification failed for unexpected reason: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- FastAPI Routes ---

@app.get("/")
async def root():
    """
    A simple root endpoint. Can be used to check if the server is running.
    """
    return {"message": "Hello from FastAPI!"}

@app.get("/protected-data", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def protected_data(user: dict = Depends(get_current_user)):
    """
    An example protected endpoint that requires Firebase authentication.
    It's also rate-limited to 10 requests per minute per IP address.
    """
    uid = user.get('uid')
    email = user.get('email')

    # In a real application, you would typically fetch user-specific data
    # from your database (e.g., Firestore, PostgreSQL, MongoDB) here
    # using the 'uid' obtained from the verified Firebase ID token.

    return {
        "message": f"Hello, {email}! This is protected data from FastAPI.",
        "user_id": uid,
        "email": email,
        "source": "FastAPI Backend (Firebase Authenticated & Rate-Limited)"
    }

@app.delete("/delete-user", dependencies=[Depends(RateLimiter(times=1, seconds=300))]) # Limit to 1 delete every 5 minutes
async def delete_user_account(user: dict = Depends(get_current_user)):
    """
    Endpoint to delete a user's account from Firebase Authentication.
    This operation requires an authenticated Firebase ID token and is rate-limited.
    It should also trigger deletion of associated data in your own databases.
    """
    uid = user.get('uid')
    email = user.get('email')

    if not uid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token.")

    try:
        # Step 1: Delete user from Firebase Authentication
        auth.delete_user(uid)
        print(f"User {uid} ({email}) deleted from Firebase Auth.")

        # Step 2: Implement logic here to delete all associated user data
        # from your other databases (e.g., Firestore documents, profiles in SQL DB).
        # This is CRUCIAL for data privacy and consistency.
        # Example pseudo-code:
        # from your_database_module import delete_user_data_by_uid
        # delete_user_data_by_uid(uid)

        return {"message": "User account and associated data deleted successfully."}

    except firebase_admin.exceptions.FirebaseError as e:
        # Catch specific Firebase Admin SDK errors
        if "user-not-found" in str(e):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in Firebase Authentication.")
        else:
            print(f"Firebase error deleting user {uid}: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete user account due to Firebase error: {e}")
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error deleting user {uid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete user account: {e}")

# You could add other endpoints here, e.g., for updating user profile data
# that's stored in your own database, accessible only after Firebase authentication.