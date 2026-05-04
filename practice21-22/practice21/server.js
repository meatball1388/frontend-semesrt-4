const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { nanoid } = require("nanoid");
const { createClient } = require("redis");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
const ACCESS_SECRET = "access_secret_key";
const REFRESH_SECRET = "refresh_secret_key";
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// Время хранения кэша (в секундах)
const PRODUCTS_CACHE_TTL = 300; // 5 минут
const USERS_CACHE_TTL = 60; // 1 минута

// Имитация базы данных (на основе Практики 11)
let users = [];
let products = [];
const refreshTokens = new Set();

// Настройка Redis клиента
const redisClient = createClient({
  url: "redis://127.0.0.1:6379"
});

redisClient.on("error", (err) => {
  -
  console.error("Redis error:", err);
});

async function initRedis() {
  try {
    await redisClient.connect();
    console.log("✅ Подключено к Redis");
  } catch (err) {
    console.error("❌ Ошибка подключения к Redis:", err.message);
    console.log("Убедитесь, что Redis запущен на порту 6379");
  }
}

// Вспомогательные функции JWT
function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// Middleware аутентификации
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Middleware ролей
function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// --- REDIS CACHE MIDDLEWARE ---

function cacheMiddleware(keyBuilder, ttl) {
  return async (req, res, next) => {
    if (!redisClient.isOpen) return next();

    try {
      const key = keyBuilder(req);
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log(`[Cache] HIT: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`[Cache] MISS: ${key}`);
      req.cacheKey = key;
      req.cacheTTL = ttl;

      // Перехватываем res.json для сохранения в кэш
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        saveToCache(key, body, ttl);
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Cache middleware error:", err);
      next();
    }
  };
}

async function saveToCache(key, data, ttl) {
  if (!redisClient.isOpen) return;
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
  } catch (err) {
    console.error("Cache save error:", err);
  }
}

async function invalidateCache(pattern) {
  if (!redisClient.isOpen) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Cache] Invalidated pattern: ${pattern} (${keys.length} keys)`);
    }
  } catch (err) {
    console.error("Cache invalidate error:", err);
  }
}

// --- МАРШРУТЫ AUTH ---

app.post("/api/auth/register", async (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nanoid(),
    email,
    first_name,
    last_name,
    passwordHash,
    role: role || "user"
  };
  users.push(user);

  await invalidateCache("users:*");

  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);

  res.json({ accessToken, refreshToken });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { passwordHash, ...userInfo } = user;
  res.json(userInfo);
});

// --- МАРШРУТЫ PRODUCTS ---

app.get(
  "/api/products",
  cacheMiddleware(() => "products:all", PRODUCTS_CACHE_TTL),
  async (req, res) => {
    res.json(products);
  }
);

app.get(
  "/api/products/:id",
  cacheMiddleware((req) => `products:${req.params.id}`, PRODUCTS_CACHE_TTL),
  async (req, res) => {
    const product = products.find((p) => p.id === req.params.id || p.id == req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  }
);

app.post("/api/products", authMiddleware, roleMiddleware(["admin", "seller"]), async (req, res) => {
  const { title, category, price, description, stock, rating, image } = req.body;
  const newProduct = {
    id: nanoid(),
    title,
    category,
    price: Number(price),
    description: description || "",
    stock: Number(stock) || 0,
    rating: Number(rating) || 0,
    image: image || "/img/asus_laptop.jpeg"
  };
  products.push(newProduct);
  await invalidateCache("products:*");
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", authMiddleware, roleMiddleware(["admin", "seller"]), async (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id || p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  products[index] = { ...products[index], ...req.body, id: req.params.id };
  await invalidateCache("products:*");
  res.json(products[index]);
});

app.delete("/api/products/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id || p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  products.splice(index, 1);
  await invalidateCache("products:*");
  res.status(204).send();
});

// --- Default Data Seed ---
(async () => {
  const saltRounds = 10;

  users.push({
    id: "admin_id",
    email: "admin@test.com",
    first_name: "Admin",
    last_name: "User",
    passwordHash: await bcrypt.hash("admin123", saltRounds),
    role: "admin",
  });

  users.push({
    id: "seller_id",
    email: "seller@test.com",
    first_name: "Seller",
    last_name: "One",
    passwordHash: await bcrypt.hash("seller123", saltRounds),
    role: "seller",
  });

  users.push({
    id: "user_id",
    email: "user@test.com",
    first_name: "John",
    last_name: "Doe",
    passwordHash: await bcrypt.hash("user123", saltRounds),
    role: "user",
  });

  products.push(
    { id: "1", title: "ASUS ROG Laptop", category: "Laptops", price: 75000, stock: 15, rating: 4.5, image: "/img/asus_laptop.jpeg", description: "Gaming laptop" },
    { id: "2", title: "MacBook Pro 16", category: "Laptops", price: 150000, stock: 8, rating: 4.9, image: "/img/macbook_pro.jpeg", description: "Apple Pro laptop" },
    { id: "3", title: "iPhone 15 Pro", category: "Smartphones", price: 90000, stock: 25, rating: 4.8, image: "/img/iphone_15.jpeg", description: "Apple flagship" },
    { id: "4", title: "Samsung S24 Ultra", category: "Smartphones", price: 85000, stock: 20, rating: 4.7, image: "/img/samsung_galaxy_s24.jpeg", description: "Samsung flagship" }
  );
})();

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Запуск
initRedis().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  });
});

