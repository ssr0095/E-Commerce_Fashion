import multer from "multer";

// Store files in memory as buffers (no disk storage needed)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit per file
  },
});

export default upload;