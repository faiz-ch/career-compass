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

  getCurrentUser: async () => {
    return apiRequest('/students/me');
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


  getRecommendedCareers: async () => {
    return apiRequest('/careers/recommended/me');
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
  getCareerRecommendations: async (payload: {
    interview_analysis: {
      technical_skills: string[];
      soft_skills: string[];
      learning_style: string;
      career_interests: string[];
      confidence_level: string;
    };
  }) => {
    return apiRequest('/ai/career/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getInterviewResult: async () => {
    return apiRequest('/ai/interview/result');
  },
};

// Scraper API
export const scraperAPI = {
  scrapeResult: async (params: {
    roll_number: string;
    exam_type: string;
    year: string;
  }) => {
    const queryParams = new URLSearchParams({
      roll_number: params.roll_number,
      exam_type: params.exam_type,
      year: params.year,
    });
    
    return apiRequest(`/scraper/scrape-result/?${queryParams.toString()}`);
  },
};

// Admissions API (simplified)
export const admissionsAPI = {
  submitApplicationForm: async (formData: any) => {
    return apiRequest('/admissions/application-form', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  getCareers: async () => {
    return apiRequest('/careers/recommended/me');
  },
};
