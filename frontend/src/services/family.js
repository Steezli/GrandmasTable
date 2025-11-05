import api from './api';

export const familyService = {
  async getFamilies() {
    const response = await api.get('/families');
    return response.data;
  },

  async getFamily(familyId) {
    const response = await api.get(`/families/${familyId}`);
    return response.data;
  },

  async createFamily(familyData) {
    const response = await api.post('/families', familyData);
    return response.data;
  },

  async updateFamily(familyId, familyData) {
    const response = await api.patch(`/families/${familyId}`, familyData);
    return response.data;
  },

  async inviteMember(familyId, email) {
    const response = await api.post(`/families/${familyId}/invite`, { email });
    return response.data;
  },

  async generateInviteLink(familyId) {
    const response = await api.post(`/families/${familyId}/invite`, {});
    return response.data;
  },

  async joinFamily(inviteCode) {
    const response = await api.post('/families/join', { invite_code: inviteCode });
    return response.data;
  },

  async removeMember(familyId, userId) {
    const response = await api.delete(`/families/${familyId}/members/${userId}`);
    return response.data;
  }
};

