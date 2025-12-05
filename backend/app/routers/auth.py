from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from app.database import user_collection
from app.models import UserLogin, UserRegister, TokenResponse, UserResponse, UserSettings, User
from app.auth import get_password_hash, verify_password, create_access_token, decode_access_token, oauth2_scheme
from datetime import datetime

router = APIRouter()

def user_helper(user) -> dict:
    """Helper function to format user document"""
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "name": user["name"],
        "profilePhoto": user.get("profilePhoto"),
        "settings": user.get("settings", {"theme": False, "soundEffects": True, "Notifications": True}),
        "createdAt": user.get("createdAt", datetime.utcnow()),
    }

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = await user_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if username already exists
    existing_user = await user_collection.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = await user_collection.find_one({"email": user_data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = {
        "username": user_data.username,
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name,
        "profilePhoto": None,
        "settings": {
            "theme": False,
            "soundEffects": True,
            "Notifications": True,
            "backgroundImage": "https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg",
            "accentColor": "#007aff"
        },
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await user_collection.insert_one(new_user)
    created_user = await user_collection.find_one({"_id": result.inserted_id})
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.username})
    
    # Sync user to Dgraph
    try:
        from app.databases.dgraph import dgraph_client
        await dgraph_client.upsert_user(str(created_user["_id"]), created_user["username"])
    except Exception as e:
        print(f"Warning: Failed to sync user to Dgraph: {e}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_helper(created_user)
    }

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """Login user and return JWT token"""
    # Find user by username
    user = await user_collection.find_one({"username": user_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_helper(user)
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user"""
    return user_helper(current_user)

@router.post("/token", response_model=TokenResponse)
async def login_with_form(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 compatible token login (for API docs)"""
    user = await user_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": form_data.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_helper(user)
    }
