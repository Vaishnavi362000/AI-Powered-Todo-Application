import api from '../config';

export const aiService = {
  getSimilarTasks: async (title, description, existingTasks = []) => {
    try {
      const text = `${title} ${description}`.trim();
      if (!text) return [];

      const response = await api.post('/api/suggestions/similar', {
        text,
        existing_tasks: existingTasks
      });
      
      console.log('API Response:', response.data); // Debug log
      
      if (response.data.status === 'error') {
        console.error('Error from AI service:', response.data.error);
        return [];
      }
      
      return response.data.suggestions;
    } catch (error) {
      console.error('Error getting similar tasks:', error);
      return [];
    }
  },

  getSuggestedCategory: async (title, description) => {
    try {
      const response = await api.post('/api/suggestions/category', {
        title,
        description
      });
      return response.data.category;
    } catch (error) {
      console.error('Error getting category suggestion:', error);
      return 'personal'; // default category
    }
  }
};