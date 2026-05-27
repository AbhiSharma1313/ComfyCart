import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Auth from "./Auth";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Admin form states 
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  // For User auth state 
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  useEffect(() => 
    {
    getProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0 && user) {
      fetchCart();
    }
  }, [products, user]);

  // To Fetch all the products from the backend
  const getProducts = async () => {
    const response = await axios.get(
      "http://127.0.0.1:8000/products"
    );
    setProducts(response.data);
  };

  // Fetch user cart items
  const fetchCart = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/cart/${user.user_id}`
      );

      const fullCart = res.data
        .map((item) => {
          const product = products.find(
            (p) => p.id === item.product_id
          );

          if (!product) return null;

          return {
            ...product,
            cart_id: item.id,
          };
        })
        .filter(Boolean);

      setCartItems(fullCart);

    } catch (error) {
      console.log(error);
    }
  };

  // Add to cart
  const addToCart = async (product) => {
    await axios.post(
      `http://127.0.0.1:8000/cart/${user.user_id}/${product.id}`
    );

    fetchCart();
  };

  // Remove from cart
  const removeFromCart = async (cartId) => {
    await axios.delete(
      `http://127.0.0.1:8000/cart/${cartId}`
    );

    fetchCart();
  };

  // Add / Update product
  const saveProduct = async () => {
    const productData = {
      name,
      price: Number(price),
      image_url: imageUrl,
      category,
      description,
    };

    if (editId) {
      await axios.put(
        `http://127.0.0.1:8000/products/${editId}`,
        productData
      );
      setEditId(null);
    } else {
      await axios.post(
        "http://127.0.0.1:8000/products",
        productData
      );
    }

    setName("");
    setPrice("");
    setImageUrl("");
    setCategory("");
    setDescription("");

    getProducts();
  };

  // Delete product
  const deleteProduct = async (id) => {
    await axios.delete(
      `http://127.0.0.1:8000/products/${id}`
    );
    getProducts();
  };

  // Edit product
  const editProduct = (product) => {
    setEditId(product.id);
    setName(product.name);
    setPrice(product.price);
    setImageUrl(product.image_url);
    setCategory(product.category);
    setDescription(product.description);
  };

  // Search + Category filter
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Total cart price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price,
    0
  );

  // Show auth page first
  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <h1>🛒 ComfyCart</h1>

        <div className="user-section">
          <span className="welcome-text">
            Hi, {user.name}
          </span>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("user");
              setUser(null);
            }}
          >
            Logout
          </button>

          <div
            className="cart"
            onClick={() => setShowCart(!showCart)}
          >
            Cart ({cartItems.length})
          </div>
        </div>
      </nav>

      {/* Admin Panel */}
      <div className="admin-panel">
        <h2>Admin Panel</h2>

        <input
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <button onClick={saveProduct}>
          {editId
            ? "Update Product"
            : "Add Product"}
        </button>
      </div>

      {/* Search */}
      <input
        className="search-bar"
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {/* Category Filter */}
      <select
        className="category-filter"
        value={selectedCategory}
        onChange={(e) =>
          setSelectedCategory(e.target.value)
        }
      >
        <option>All</option>
        <option>Electronics</option>
        <option>Clothing</option>
        <option>Furniture</option>
      </select>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-sidebar">
          <h2>Your Cart</h2>

          {cartItems.length === 0 ? (
            <p>Cart is empty</p>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={index}
                className="cart-item"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                />

                <div>
                  <p>{item.name}</p>
                  <p>₹ {item.price}</p>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeFromCart(item.cart_id)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}

          <h3>Total: ₹ {totalPrice}</h3>
        </div>
      )}

      {/* Products */}
      <div className="products-container">
        {filteredProducts.map((product) => (
          <div
            className="card"
            key={product.id}
          >
            <img
              src={product.image_url}
              alt={product.name}
            />

            <h3>{product.name}</h3>
            <p className="price">
              ₹ {product.price}
            </p>
            <p>{product.category}</p>
            <p>{product.description}</p>

            <button
              onClick={() =>
                addToCart(product)
              }
            >
              Add to Cart
            </button>

            <button
              onClick={() =>
                editProduct(product)
              }
            >
              Edit
            </button>

            <button
              onClick={() =>
                deleteProduct(product.id)
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">
        © 2026 ComfyCart | Built with
        React + FastAPI + MySQL
      </footer>
    </div>
  );
}

export default App;