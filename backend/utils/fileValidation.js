  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxSize = 3 * 1024 * 1024; // 3MB

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, AVIF, or WEBP images are allowed.");
    }
    if (file.size > maxSize) {
      throw new Error("File size must be less than 3MB.");
    }
    return true;
  };

  export default validateFile