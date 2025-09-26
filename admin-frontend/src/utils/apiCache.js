import axios from 'axios';

// Simple in-memory cache for API responses
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${url}?${JSON.stringify(sortedParams)}`;
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  get(key) {
    const expiry = this.cacheExpiry.get(key);
    
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }
}

const apiCache = new ApiCache();

// Enhanced axios instance with caching
const cachedAxios = axios.create();

// Request interceptor to check cache
cachedAxios.interceptors.request.use((config) => {
  // Only cache GET requests
  if (config.method === 'get') {
    const cacheKey = apiCache.generateKey(config.url, config.params);
    const cachedResponse = apiCache.get(cacheKey);
    
    if (cachedResponse) {
      // Return cached response
      config.adapter = () => Promise.resolve(cachedResponse);
    } else {
      // Store cache key for response interceptor
      config.cacheKey = cacheKey;
    }
  }
  
  return config;
});

// Response interceptor to store in cache
cachedAxios.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.config.cacheKey) {
      const ttl = response.config.cacheTTL || apiCache.defaultTTL;
      apiCache.set(response.config.cacheKey, response, ttl);
    }
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions with caching
export const cachedApi = {
  // Get institutions with caching
  getInstitutions: (params = {}) => {
    return cachedAxios.get('/api/institutions', { 
      params,
      cacheTTL: 10 * 60 * 1000 // 10 minutes for institutions
    });
  },

  // Get courses with caching
  getCourses: (institutionId, params = {}) => {
    return cachedAxios.get(`/api/institutions/${institutionId}/courses`, { 
      params,
      cacheTTL: 10 * 60 * 1000 // 10 minutes for courses
    });
  },

  // Get resources with shorter cache
  getResources: (params = {}) => {
    return cachedAxios.get('/api/resources', { 
      params,
      cacheTTL: 2 * 60 * 1000 // 2 minutes for resources
    });
  },

  // Get jobs with caching
  getJobs: (params = {}) => {
    return cachedAxios.get('/api/jobs', { 
      params,
      cacheTTL: 5 * 60 * 1000 // 5 minutes for jobs
    });
  },

  // Clear cache for specific patterns
  clearCache: (pattern) => {
    if (pattern) {
      apiCache.invalidatePattern(pattern);
    } else {
      apiCache.clear();
    }
  }
};

// Clear cache when user logs out
export const clearUserCache = () => {
  apiCache.clear();
};

export default cachedAxios;
