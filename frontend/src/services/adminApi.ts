const API_BASE_URL = 'http://localhost:8000/api/v1/admin';

class AdminApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // User Management
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }

    return response.json();
  }

  async deleteUser(userId: number) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }

  // Career Management
  async getCareers() {
    const response = await fetch(`${API_BASE_URL}/careers`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch careers');
    }

    return response.json();
  }

  async deleteCareer(careerId: number) {
    const response = await fetch(`${API_BASE_URL}/careers/${careerId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete career');
    }
  }

  // Program Management
  async getPrograms() {
    const response = await fetch(`${API_BASE_URL}/programs`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch programs');
    }

    return response.json();
  }

  async deleteProgram(programId: number) {
    const response = await fetch(`${API_BASE_URL}/programs/${programId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete program');
    }
  }

  // Admin Management
  async createAdmin(adminData: any) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(adminData),
    });

    if (!response.ok) {
      throw new Error('Failed to create admin');
    }

    return response.json();
  }
}

export const adminApi = new AdminApiService();
