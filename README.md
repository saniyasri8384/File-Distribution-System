# FileFlow – Secure File Distribution System

FileFlow is a full-stack web application designed to make file storage, management, and sharing simple and secure. Users can upload files, access their stored documents, preview and download files, and share them with other users using permission-based access.

The application uses MongoDB Atlas for database management and Cloudinary for secure cloud file storage.

## ✨ Features

- **User Authentication:** Secure user registration and login using JWT authentication.
- **File Upload:** Upload files and store them securely in Cloudinary.
- **File Management:** View and manage uploaded files.
- **File Preview:** Preview supported files directly through the application.
- **File Download:** Download files with appropriate access permissions.
- **File Sharing:** Share files with other registered users.
- **Permission Management:** Control whether recipients can view or download shared files.
- **Secure File Deletion:** Delete files from cloud storage and their corresponding database records.
- **Activity Tracking:** Maintain records of file-related activities and download history.

## 🛠️ Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- Multer

### Database and Cloud Storage
- MongoDB Atlas
- Mongoose
- Cloudinary

### Development Tools
- Visual Studio Code
- Git and GitHub
- Thunder Client
- Postman (optional)

## 📂 Project Structure

```text
FileFlow/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
└── README.md
```

*Note: Adjust the folder names if your actual project structure differs.*

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:
- Node.js and npm
- MongoDB Atlas account
- Cloudinary account
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd FileFlow
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace the placeholder values with your own credentials. Never upload your `.env` file to GitHub.

Start the backend server:

```bash
npm run dev
```

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

If your frontend uses a different development command, use the script defined in its `package.json`.

### 4. Access the Application

Open the local URL displayed in your frontend terminal, usually:

```text
http://localhost:5173
```

Make sure the backend is also running.

## 🔐 Security

- JWT-based authentication for protected routes.
- Permission-based file access.
- Secure cloud storage using Cloudinary.
- Environment variables for sensitive credentials.
- Access validation for shared files.

## 🚀 Deployment

The application is being prepared for cloud deployment using:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **File Storage:** Cloudinary

## 👩‍💻 Author

**Saniya Srivastava**

B.Tech – Computer Science and Engineering

GitHub: YOUR_GITHUB_PROFILE_URL

---

*FileFlow – Making file storage and sharing easier, safer, and more accessible.*
