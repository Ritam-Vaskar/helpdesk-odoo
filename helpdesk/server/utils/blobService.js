const { BlobServiceClient } = require('@azure/storage-blob');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME || 'ticketattachments';

let containerClient = null;

const initBlobService = async () => {
  try {
    if (!connectionString) {
      throw new Error('Azure Storage connection string is not configured');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Ensure container exists
    await containerClient.createIfNotExists();
    
    return containerClient;
  } catch (error) {
    console.error('Failed to initialize blob service:', error);
    throw error;
  }
};

const uploadToBlob = async (file) => {
  try {
    if (!containerClient) {
      await initBlobService();
    }

    if (!file || !file.buffer) {
      throw new Error('Invalid file data');
    }

    const blobName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(file.buffer, file.buffer.length, {
      blobHTTPHeaders: { blobContentType: file.mimetype }
    });
    
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw error;
  }
};

module.exports = { uploadToBlob, initBlobService };
