
// This service handles uploading images to a public cloud host (Imgur)
// so that images are accessible across different devices via a URL.

const IMGUR_CLIENT_ID = 'd303e488e3a2414'; // Demo Client ID. *In production, replace with your own from api.imgur.com*

export const uploadToCloud = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.link; // Returns the https://i.imgur.com/... URL
    } else {
      console.error('Upload failed:', data);
      throw new Error('圖片上傳失敗，請檢查網路連線或檔案格式。');
    }
  } catch (error) {
    console.error('Network error:', error);
    throw new Error('無法連線至圖片伺服器。');
  }
};
