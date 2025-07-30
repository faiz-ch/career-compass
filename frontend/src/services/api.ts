const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Helper function to make API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  // Ensure headers is a Record<string, string>
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  register: async (studentData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  login: async (credentials: any) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Students API
export const studentsAPI = {
  getMyProfile: async () => {
    return apiRequest('/students/me');
  },

  updateMyProfile: async (updateData: any) => {
    return apiRequest('/students/me', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  getStudentById: async (id: number) => {
    return apiRequest(`/students/${id}`);
  },

  listStudents: async () => {
    return apiRequest('/students/');
  },
};

// Programs API
export const programsAPI = {
  create: async (programData: any) => {
    return apiRequest('/programs/', {
      method: 'POST',
      body: JSON.stringify(programData),
    });
  },

  getById: async (id: number) => {
    return apiRequest(`/programs/${id}`);
  },

  list: async () => {
    return apiRequest('/programs/');
  },

  update: async (id: number, updateData: any) => {
    return apiRequest(`/programs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  delete: async (id: number) => {
    return apiRequest(`/programs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Careers API
export const careersAPI = {
  create: async (careerData: any) => {
    return apiRequest('/careers/', {
      method: 'POST',
      body: JSON.stringify(careerData),
    });
  },

  getById: async (id: number) => {
    return apiRequest(`/careers/${id}`);
  },

  list: async () => {
    return apiRequest('/careers/');
  },

  update: async (id: number, updateData: any) => {
    return apiRequest(`/careers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  delete: async (id: number) => {
    return apiRequest(`/careers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admissions API
export const admissionsAPI = {
  apply: async (admissionData: any) => {
    return apiRequest('/admissions/', {
      method: 'POST',
      body: JSON.stringify(admissionData),
    });
  },
  getMyAdmissions: async () => {
    return apiRequest('/admissions/me');
  },
  getById: async (id: number) => {
    return apiRequest(`/admissions/${id}`);
  },
  updateStatus: async (id: number, statusData: any) => {
    return apiRequest(`/admissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  },
  delete: async (id: number) => {
    return apiRequest(`/admissions/${id}`, {
      method: 'DELETE',
    });
  },
};

// AI API
export const aiAPI = {
  generateInterviewQuestions: async ({ interests }: { interests: string }) => {
    return apiRequest('/ai/interview/questions', {
      method: 'POST',
      body: JSON.stringify({ interests }),
    });
  },
  analyzeInterviewResponses: async (payload: {
    interests: string;
    responses: string[];
  }) => {
    return apiRequest('/ai/interview/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  // Dynamic interview endpoints
  startDynamicInterview: async ({ interests }: { interests: string }) => {
    return apiRequest('/ai/interview/dynamic/start', {
      method: 'POST',
      body: JSON.stringify({ interests }),
    });
  },
  getNextDynamicQuestion: async (payload: {
    interests: string;
    previous_questions: string[];
    previous_responses: string[];
    current_question_number: number;
  }) => {
    return apiRequest('/ai/interview/dynamic/next', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
}; 