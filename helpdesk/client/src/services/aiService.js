import axios from 'axios';

const AI_API_URL = 'http://localhost:8080'; // Flask server URL

const aiService = {
  summarizeText: async (text) => {
    try {
      const response = await axios.post(`${AI_API_URL}/summarize`, { text });
      return response.data.summary;
    } catch (error) {
      console.error('Error getting summary:', error);
      throw error;
    }
  },

  getSummary: async (description) => {
    try {
      const response = await axios.post(`${AI_API_URL}/summarize`, {
        text: description
      });
      return response.data.summary;
    } catch (error) {
      console.error('Error getting summary:', error);
      throw new Error('Failed to get AI summary');
    }
  }
};

export default aiService;
