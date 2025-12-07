import axios from "axios";

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat-app"); // Replace with your upload preset

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/mayavi/auto/upload",
      formData
    );
    console.log("File uploaded:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export default uploadFile;
