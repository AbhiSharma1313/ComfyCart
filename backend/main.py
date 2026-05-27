from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal
from models import Base, Product, User, UserCart
import schemas
from schemas import UserCreate, UserLogin


app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)


# DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# HOME endpoint
@app.get("/")
def home():
    return {"message": "Welcome to ComfyCart"}


# All related to PRODUCTS

# Create product
@app.post("/products")
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    new_product = Product(
        name=product.name,
        price=product.price,
        image_url=product.image_url,
        category=product.category,
        description=product.description
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


# Get all products
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


# Delete product
@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {"message": "Product deleted"}


# Update product
@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    updated_product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.name = updated_product.name
    product.price = updated_product.price
    product.image_url = updated_product.image_url
    product.category = updated_product.category
    product.description = updated_product.description

    db.commit()
    db.refresh(product)

    return product


# User AUTH 

# Signup
@app.post("/signup")
def signup(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Signup successful",
        "user_id": new_user.id,
        "name": new_user.name
    }


# Login
@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email,
        User.password == user.password
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "Login successful",
        "user_id": existing_user.id,
        "name": existing_user.name
    }


# Now USER CART for each user

# Get cart for user
@app.get("/cart/{user_id}")
def get_user_cart(
    user_id: int,
    db: Session = Depends(get_db)
):
    return db.query(UserCart).filter(
        UserCart.user_id == user_id
    ).all()


# Add product to user cart
@app.post("/cart/{user_id}/{product_id}")
def add_to_user_cart(
    user_id: int,
    product_id: int,
    db: Session = Depends(get_db)
):
    existing = db.query(UserCart).filter(
        UserCart.user_id == user_id,
        UserCart.product_id == product_id
    ).first()

    if existing:
        return {"message": "Already in cart"}

    new_item = UserCart(
        user_id=user_id,
        product_id=product_id
    )

    db.add(new_item)
    db.commit()

    return {"message": "Added to cart"}


# Remove from cart
@app.delete("/cart/{cart_id}")
def remove_from_cart(
    cart_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(UserCart).filter(
        UserCart.id == cart_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    db.delete(item)
    db.commit()

    return {"message": "Removed"}