from pydantic import BaseModel, Field, EmailStr, ConfigDict, GetCoreSchemaHandler
from typing import Optional, List, Any, Dict
from datetime import datetime
from bson import ObjectId
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(ObjectId),
                ]),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x),
                when_used='json'
            ),
        )

class MongoBaseModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

# --- User Models ---

class UserSettings(BaseModel):
    theme: bool = False
    soundEffects: bool = True
    Notifications: bool = True
    backgroundImage: Optional[str] = None

class User(MongoBaseModel):
    username: str
    email: EmailStr
    password: str  # Hashed password
    name: str
    profilePhoto: Optional[str] = None
    settings: UserSettings
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CreateUser(BaseModel):
    username: str
    email: EmailStr
    password: str  # Plain password, will be hashed
    name: str
    profilePhoto: Optional[str] = None
    settings: Optional[UserSettings] = None

class UpdateUser(BaseModel):
    name: Optional[str] = None
    profilePhoto: Optional[str] = None
    settings: Optional[UserSettings] = None
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# --- Song Models ---

class Song(MongoBaseModel):
    title: str
    artist: str
    album: Optional[str] = None
    mood: str
    albumArt: Optional[str] = None
    duration: str # Keeping as string as per requirement, though int might be better for calculation
    soundFile: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class EmbeddedSong(BaseModel):
    id: int = Field(alias="_id")  # Changed to int to match mock song IDs
    title: str
    artist: str
    album: Optional[str] = None
    mood: str
    albumArt: Optional[str] = None
    duration: int # Requirement says int here in Entries Collection
    createdAt: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

# --- Entry Models ---

class Entry(MongoBaseModel):
    userId: PyObjectId
    date: datetime
    text: str
    mood: str
    song: Optional[EmbeddedSong] = None
    files: List[PyObjectId] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CreateEntry(BaseModel):
    userId: str # Input as string, converted to ObjectId
    date: datetime
    text: str
    mood: str
    song: Optional[Dict[str, Any]] = None # Will need processing
    files: List[str] = []

# --- File Models ---

class FileMetadata(BaseModel):
    # Common fields or specific ones based on type
    imageUrl: Optional[str] = None
    extension: Optional[str] = None
    author: Optional[str] = None
    bookUrl: Optional[str] = None
    coverUrl: Optional[str] = None
    videoUrl: Optional[str] = None
    websiteUrl: Optional[str] = None
    content: Optional[str] = None

class FileModel(MongoBaseModel):
    entryId: PyObjectId
    fileName: str
    fileType: str
    mood: str
    metadata: FileMetadata
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class CreateFile(BaseModel):
    entryId: str
    fileName: str
    fileType: str
    mood: str
    metadata: FileMetadata

# --- Authentication Models ---

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    name: str
    profilePhoto: Optional[str] = None
    settings: UserSettings
    createdAt: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
    )

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

