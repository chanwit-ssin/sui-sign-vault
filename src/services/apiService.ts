
import axios from 'axios';

// Configure axios instance with appropriate headers
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  }
});

export const fetchBlobMetadata = async (blobId: string) => {
  try {
    // Using a CORS proxy to bypass CORS restrictions
    const corsProxyUrl = 'https://corsproxy.io/?';
    const targetUrl = `https://walrus-testnet.lionscraft.blockscape.network:9185/v1/blobs/${blobId}/metadata`;
    
    const response = await api.get(`${corsProxyUrl}${encodeURIComponent(targetUrl)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blob metadata:', error);
    throw error;
  }
};

// Add more API methods as needed
