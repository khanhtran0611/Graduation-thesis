# API Upload Ảnh lên MinIO

## Endpoint

```
POST /api/questions/upload-image
```

## Mô tả

API này cho phép upload một file ảnh lên MinIO và trả về URL của ảnh đã upload.

## Request Format

- **Content-Type**: `multipart/form-data`

### Form Data Fields

#### Required Fields:

- `image` (file): File ảnh cần upload

## Allowed File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WEBP (.webp)

## File Size Limit

- Maximum: 10MB

### Example Frontend Code (JavaScript/TypeScript):

```javascript
// Với vanilla JavaScript/Fetch
const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch("http://your-api-url/api/questions/upload-image", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("Image uploaded:", result);
    return result;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Sử dụng với input file
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    const result = await uploadImage(file);
    console.log("Image URL:", result.data.url);
  }
});
```

### Example với Axios:

```javascript
import axios from "axios";

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await axios.post("http://your-api-url/api/questions/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
};

// Sử dụng
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const result = await uploadImage(file);
    console.log("Image URL:", result.data.url);
    console.log("File name:", result.data.fileName);
  }
};
```

### Example với React:

```jsx
import React, { useState } from "react";

function ImageUploader() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/questions/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImageUrl(result.data.url);
        console.log("Upload success:", result.data.url);
      } else {
        console.error("Upload failed:", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      {imageUrl && (
        <div>
          <p>Image uploaded successfully!</p>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "300px" }} />
          <p>URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
```

## Response

### Success (200 OK):

```json
{
  "message": "Image uploaded successfully",
  "data": {
    "url": "http://minio-url:9000/bucket-name/images/uuid_timestamp.jpg",
    "fileName": "images/uuid_timestamp.jpg"
  }
}
```

### Error (400 Bad Request):

```json
{
  "message": "No image file provided"
}
```

### Error (500 Internal Server Error):

```json
{
  "message": "Failed to upload image",
  "error": "Error details"
}
```

## Notes

1. **File Size Limit**: Maximum 10MB per file
2. **Allowed Image Types**: JPEG, JPG, PNG, GIF, WEBP
3. **File Storage**: Files are stored in MinIO with unique names using UUID and timestamp
4. **Image URLs**: The response contains the full URL to access the uploaded image
5. **Field Name**: The file must be sent with the field name `"image"`
6. **Storage Path**: Images are stored in the `images/` folder in MinIO bucket
7. **Unique Names**: Each uploaded file gets a unique name using UUID and timestamp to avoid conflicts
