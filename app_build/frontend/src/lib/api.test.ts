// app_build/frontend/src/lib/api.test.ts
import { publicApi, authApi } from './api';

describe('API Client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('publicApi', () => {
    it('getArticles should make a GET request to /articles', async () => {
      const mockResponse = { success: true, data: { data: [], total: 0 } };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await publicApi.getArticles();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/articles'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('getArticles with params should format query parameters correctly', async () => {
      const mockResponse = { success: true, data: { data: [], total: 0 } };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      await publicApi.getArticles({ page: '2', limit: '5' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/articles?page=2&limit=5'),
        expect.any(Object)
      );
    });
  });

  describe('authApi', () => {
    it('login should make a POST request with credentials', async () => {
      const mockResponse = { success: true, data: { token: 'mock-token', username: 'admin' } };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const result = await authApi.login('admin@email.com', 'pwd123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'admin@email.com', password: 'pwd123' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});