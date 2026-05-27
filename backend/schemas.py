from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    price: float
    image_url: str
    category: str
    description: str


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True



class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str