import { 
  getUserData, 
  saveUserData, 
  clearUserData, 
  saveToken, 
  getToken, 
  clearToken, 
  isAuthenticated, 
  logoutUser,
  loginUser,
  signupUser,
  fetchUserData,
  refreshUserData,
  getStoredUserData
} from './authUtils';

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

import { jwtDecode } from 'jwt-decode';

describe('Auth Utilities', () => {
  let consoleSpy;
  let originalFetch;

  beforeEach(() => {
    localStorage.clear();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    originalFetch = global.fetch;
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    global.fetch = originalFetch;
  });

  describe('Token Management', () => {
    it('saves and retrieves token', () => {
      saveToken('test-token');
      expect(getToken()).toBe('test-token');
    });

    it('clears token', () => {
      saveToken('test-token');
      clearToken();
      expect(getToken()).toBeNull();
    });

    it('returns null when no token exists', () => {
      expect(getToken()).toBeNull();
    });

    it('checks if user is authenticated with token', () => {
      saveToken('test-token');
      expect(isAuthenticated()).toBe(true);
    });

    it('checks if user is not authenticated without token', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('User Data Management', () => {
    it('saves and retrieves user data', () => {
      const userData = { id: 1, name: 'Alice' };
      saveUserData(userData);
      expect(getUserData()).toEqual(userData);
    });

    it('clears user data', () => {
      const userData = { id: 2, name: 'Bob' };
      saveUserData(userData);
      clearUserData();
      expect(getUserData()).toBeNull();
    });

    it('returns null when no user data exists', () => {
      expect(getUserData()).toBeNull();
    });

    it('throws error when retrieving invalid JSON user data', () => {
      localStorage.setItem('userData', '{invalid json}');
      expect(() => getUserData()).toThrow();
    });

    it('handles empty user data gracefully', () => {
      saveUserData({});
      expect(getUserData()).toEqual({});
    });
  });

  describe('getStoredUserData', () => {
    it('returns specific key from stored user data', () => {
      const userData = { id: 1, name: 'Alice', email: 'alice@test.com' };
      saveUserData(userData);
      expect(getStoredUserData('name')).toBe('Alice');
      expect(getStoredUserData('email')).toBe('alice@test.com');
    });

    it('returns null for non-existent key', () => {
      const userData = { id: 1, name: 'Alice' };
      saveUserData(userData);
      expect(getStoredUserData('nonexistent')).toBeNull();
    });

    it('returns null when no user data exists', () => {
      expect(getStoredUserData('name')).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('No user data found in local storage');
    });

    it('returns null when user data is invalid JSON', () => {
      localStorage.setItem('userData', '{invalid json}');
      expect(getStoredUserData('name')).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to parse user data from local storage:', 
        expect.any(Error)
      );
    });
  });

  describe('loginUser', () => {
    it('successfully logs in user and saves data', async () => {
      const mockUserData = { id: 1, name: 'Alice' };
      const mockResponse = { accessToken: 'token123' };
      
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserData,
        });

      jwtDecode.mockReturnValue({ sub: 'user123' });

      const result = await loginUser({ email: 'test@test.com', password: 'password' });

      expect(result.success).toBe(true);
      expect(getToken()).toBe('token123');
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
      });
    });

    it('handles login failure', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      await expect(loginUser({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('handles missing token in response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Success but no token' }),
      });

      const result = await loginUser({ email: 'test@test.com', password: 'password' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('No token received');
    });
  });

  describe('signupUser', () => {
    it('successfully signs up user', async () => {
      const mockResponse = { message: 'User created' };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await signupUser({ 
        email: 'test@test.com', 
        password: 'password', 
        name: 'Test User' 
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Signup successful!');
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'test@test.com', 
          password: 'password', 
          name: 'Test User' 
        }),
      });
    });

    it('handles signup failure', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Email already exists' }),
      });

      await expect(signupUser({ email: 'test@test.com', password: 'password' }))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('logoutUser', () => {
    let navigateMock;

    beforeEach(() => {
      navigateMock = jest.fn();
    });

    it('clears token and userData and navigates on successful logout', async () => {
      saveToken('abc123');
      saveUserData({ id: 1 });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Logged out' }),
      });

      await logoutUser(navigateMock);

      expect(getToken()).toBeNull();
      expect(getUserData()).toBeNull();
      expect(navigateMock).toHaveBeenCalledWith('/auth');
    });

    it('does not clear token or navigate if not authenticated', async () => {
      clearToken();
      saveUserData({ id: 1 });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Logged out' }),
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await logoutUser(navigateMock);

      expect(getUserData()).toEqual({ id: 1 });
      expect(navigateMock).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('User is not authenticated');
      
      consoleSpy.mockRestore();
    });

    it('logs error if logout fails', async () => {
      saveToken('abc123');
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Failed' }),
      });

      await logoutUser(navigateMock);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to log out:', 'Failed');
    });

    it('logs error if fetch throws', async () => {
      saveToken('abc123');
      
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await logoutUser(navigateMock);

      expect(consoleSpy).toHaveBeenCalledWith('Error logging out:', expect.any(Error));
    });
  });

  describe('fetchUserData', () => {
    it('fetches user data with valid token', async () => {
      const mockUserData = { id: 1, name: 'Alice' };
      saveToken('valid-token');
      jwtDecode.mockReturnValue({ sub: 'user123' });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      });

      const result = await fetchUserData();

      expect(result).toEqual(mockUserData);
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/auth/userdata', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'user123' }),
      });
    });

    it('handles missing token', async () => {
      clearToken();
      
      const result = await fetchUserData();

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('No tokens present');
    });

    it('handles fetch failure', async () => {
      saveToken('valid-token');
      jwtDecode.mockReturnValue({ sub: 'user123' });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'User not found' }),
      });

      const result = await fetchUserData();

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user data');
    });
  });

  describe('refreshUserData', () => {
    it('refreshes and saves user data', async () => {
      const mockUserData = { id: 1, name: 'Alice Updated' };
      saveToken('valid-token');
      jwtDecode.mockReturnValue({ sub: 'user123' });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUserData,
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await refreshUserData();

      expect(getUserData()).toEqual(mockUserData);
      expect(consoleSpy).toHaveBeenCalledWith('User data refreshed', mockUserData);
      
      consoleSpy.mockRestore();
    });

    it('handles missing token during refresh', async () => {
      clearToken();
      
      await refreshUserData();

      expect(consoleSpy).toHaveBeenCalledWith('No tokens present');
    });
  });
});