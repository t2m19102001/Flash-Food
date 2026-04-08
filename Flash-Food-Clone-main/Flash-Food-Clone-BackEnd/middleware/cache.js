// Simple in-memory cache for performance optimization
class SimpleCache {
  constructor(ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }

  size() {
    return this.cache.size;
  }
}

// Create cache instances
const orderCache = new SimpleCache(300000); // 5 minutes
const foodCache = new SimpleCache(600000); // 10 minutes
const userCache = new SimpleCache(900000); // 15 minutes

// Cache middleware factory
const createCacheMiddleware = (cache, keyGenerator) => {
  return (req, res, next) => {
    const key = keyGenerator(req);
    const cached = cache.get(key);

    if (cached) {
      console.log(`Cache HIT for key: ${key}`);
      return res.json(cached);
    }

    console.log(`Cache MISS for key: ${key}`);

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = (data) => {
      cache.set(key, data);
      return originalJson(data);
    };

    next();
  };
};

// Key generators for different endpoints
const orderListKey = (req) => `orders_list_${req.query.page || 1}_${req.query.status || 'all'}_${req.query.payment || 'all'}`;
const foodListKey = (req) => `foods_list_${req.query.category || 'all'}`;
const userListKey = (req) => `users_list_${req.query.page || 1}`;

// Cache middleware for different routes
const orderCacheMiddleware = createCacheMiddleware(orderCache, orderListKey);
const foodCacheMiddleware = createCacheMiddleware(foodCache, foodListKey);
const userCacheMiddleware = createCacheMiddleware(userCache, userListKey);

// Cache cleanup interval (run every 10 minutes)
setInterval(() => {
  console.log('Cache cleanup - Current sizes:', {
    orders: orderCache.size(),
    foods: foodCache.size(),
    users: userCache.size()
  });
}, 600000); // 10 minutes

module.exports = {
  orderCacheMiddleware,
  foodCacheMiddleware: createCacheMiddleware(foodCache, foodListKey),
  userCacheMiddleware: createCacheMiddleware(userCache, userListKey),
  orderCache,
  foodCache,
  userCache
};
