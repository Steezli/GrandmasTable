import api from './api';

export const recipeService = {
  async getRecipes(familyId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.creator_id) params.append('creator_id', filters.creator_id);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/families/${familyId}/recipes?${params.toString()}`);
    return response.data;
  },

  async getRecipe(recipeId) {
    const response = await api.get(`/recipes/${recipeId}`);
    return response.data;
  },

  async getPublicRecipe(slug) {
    const response = await api.get(`/recipes/public/${slug}`);
    return response.data;
  },

  async createRecipe(familyId, recipeData) {
    const response = await api.post(`/families/${familyId}/recipes`, recipeData);
    return response.data;
  },

  async updateRecipe(recipeId, recipeData) {
    const response = await api.patch(`/recipes/${recipeId}`, recipeData);
    return response.data;
  },

  async deleteRecipe(recipeId) {
    const response = await api.delete(`/recipes/${recipeId}`);
    return response.data;
  },

  async uploadPhoto(recipeId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/recipes/${recipeId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async searchRecipes(query, filters = {}) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters.family_id) params.append('family_id', filters.family_id);
    if (filters.category) params.append('category', filters.category);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/recipes/search?${params.toString()}`);
    return response.data;
  }
};

