# Frontend File Manager

A modern React-based file management application with authentication, file upload, and file viewing capabilities. Built with TypeScript, Vite, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)

## 🎯 Overview

This is a frontend application for a file management system that allows users to:
- Register and login with JWT authentication
- Upload files with progress tracking
- View and manage uploaded files in a table
- Download files
- View files in the browser (PDFs, images, videos)

The application uses React Query for efficient data fetching and caching, React Router for navigation, and Axios for HTTP requests with interceptors for authentication.

## ✨ Features

- **User Authentication**
  - User registration
  - User login with JWT tokens
  - Protected routes
  - Automatic token management

- **File Management**
  - File upload with progress tracking
  - File listing with metadata (name, size, type, upload date)
  - File download
  - In-browser file viewing (PDFs, images, videos)
  - File type detection and icons

- **User Interface**
  - Modern, responsive design with Tailwind CSS
  - File upload form with drag-and-drop support
  - Interactive file table with sorting and filtering
  - Modal viewer for previewing files
  - Loading states and error handling

## 🛠 Tech Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript 5.4.5
- **Build Tool**: Vite 5.2.0
- **Routing**: React Router DOM 7.9.5
- **State Management**: React Query (TanStack Query) 5.37.1
- **HTTP Client**: Axios 1.7.7
- **Form Handling**: React Hook Form 7.53.0 with Zod validation
- **Styling**: Tailwind CSS 3.4.4
- **Code Quality**: ESLint

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Backend API**: The application requires a backend API running (default: `http://localhost:8080`)

You can check your Node.js and npm versions by running:
```bash
node --version
npm --version
```

## 🚀 Installation

Follow these steps to install and set up the project:

### Step 1: Clone the Repository

If you haven't already, clone or navigate to the project directory:
```bash
cd /path/to/Assign--front-end
```

### Step 2: Install Dependencies

Install all required npm packages:
```bash
npm install
```

This command will:
- Read the `package.json` file
- Download and install all dependencies listed in `dependencies` and `devDependencies`
- Create a `node_modules` folder with all packages

**Expected output**: The installation may take a few minutes. You should see a progress indicator and eventually a success message.

### Step 3: Verify Installation

Verify that all dependencies were installed correctly:
```bash
npm list --depth=0
```

This will show you all the top-level packages that were installed.

## ⚙️ Configuration

### Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following configuration (adjust the URL if your backend runs on a different port):

```env
VITE_API_BASE_URL=http://localhost:8080
```

**Note**: 
- In development mode, the app uses a Vite proxy configured in `vite.config.ts` that forwards `/api` requests to the backend
- The `VITE_API_BASE_URL` is primarily used in production builds
- If not set, the default backend URL is `http://localhost:8080`

## ▶️ Running the Application

### Development Mode

To start the development server:

#### Step 1: Start the Backend API

Make sure your backend API is running on `http://localhost:8080` (or the URL specified in your configuration).

#### Step 2: Start the Development Server

Run the following command:
```bash
npm run dev
```

**What happens**:
- Vite starts the development server
- The application compiles and bundles your code
- A local development server starts (usually on `http://localhost:5173`)
- Your default browser should automatically open to the application
- Hot Module Replacement (HMR) is enabled for instant updates

**Expected output**:
```
  VITE v5.2.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

#### Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the login page. If you don't have an account, you can register a new one.

### Production Build

To build the application for production:

#### Step 1: Build the Application

```bash
npm run build
```

This command will:
- Run TypeScript type checking (`tsc`)
- Build and optimize the application using Vite
- Create a `dist` folder with production-ready files

**Expected output**: A `dist` folder will be created with optimized HTML, CSS, and JavaScript files.

#### Step 2: Preview the Production Build

To preview the production build locally:
```bash
npm run preview
```

This starts a local server to preview the production build.

#### Step 3: Deploy

The `dist` folder contains all the files needed for deployment. You can:
- Deploy to a static hosting service (Vercel, Netlify, etc.)
- Serve using a web server (Nginx, Apache, etc.)
- Upload to a CDN

## 📁 Project Structure

```
src/
├── api/                    # API configuration and interceptors
│   ├── index.ts           # Axios instance setup
│   └── interceptors.ts   # Request/response interceptors
├── components/            # Reusable React components
│   ├── FileTable.tsx     # File listing and management table
│   ├── ProtectedRoute.tsx # Route protection component
│   └── UploadForm.tsx    # File upload form component
├── context/               # React context providers
│   └── AuthContext.tsx   # Authentication context
├── features/              # Feature-based modules
│   ├── auth/             # Authentication feature
│   │   └── api.ts        # Auth API calls
│   └── uploads/          # File upload feature
│       ├── api.ts        # Upload API calls
│       ├── hooks.ts      # Custom React hooks
│       └── types.ts      # TypeScript types
├── layouts/              # Layout components
│   └── MainLayout.tsx    # Main application layout
├── lib/                  # Utility functions
│   └── format.ts         # Formatting utilities
├── providers/            # Context providers
│   └── QueryProvider.tsx # React Query provider
├── screens/              # Page/screen components
│   ├── Home.tsx          # Home page (file management)
│   ├── Login.tsx         # Login page
│   └── Register.tsx      # Registration page
├── types/                # TypeScript type definitions
│   └── auth.ts           # Authentication types
├── App.tsx               # Root App component
├── main.tsx              # Application entry point
├── routes.tsx            # Route configuration
└── index.css             # Global styles
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the application for production (includes type checking) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🔌 API Endpoints

The application expects the following backend API endpoints:

### Authentication
- `POST /api/user/register` - Register a new user
- `POST /api/user/login` - Login and receive JWT token

### File Management
- `POST /api/file/upload` - Upload a file (multipart/form-data)
- `GET /api/file/getAll` - Get all uploaded files
- `GET /api/file/download/{id}` - Download a file by ID

### Request/Response Format

**Login Request**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Login Response**:
```json
{
  "token": "jwt_token_string"
}
```

**File Upload**: 
- Content-Type: `multipart/form-data`
- Form field: `file`

**File List Response**:
```json
[
  {
    "id": 1,
    "fileName": "example.pdf",
    "fileSize": 1024,
    "fileType": "application/pdf",
    "uploadDate": "2024-01-01T00:00:00Z"
  }
]
```

## 🔒 Authentication Flow

1. User registers or logs in
2. JWT token is stored in `localStorage` as `auth_token`
3. Token is automatically included in API requests via Axios interceptors
4. Protected routes check for authentication
5. On logout, token is removed from `localStorage`

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port. You can also specify a different port:
```bash
npm run dev -- --port 3000
```

### Backend Connection Issues
- Ensure your backend API is running
- Check that the backend URL in `.env` or `vite.config.ts` is correct
- Verify CORS settings on the backend allow requests from `http://localhost:5173`

### Build Errors
- Run `npm run lint` to check for code issues
- Ensure all TypeScript types are correct
- Check that all dependencies are installed

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📝 Notes

- The application uses a Vite proxy in development mode to forward `/api` requests to the backend
- JWT tokens are stored in `localStorage` - ensure your browser allows this
- File uploads support progress tracking via Axios progress events
- The application automatically handles token expiration and redirects to login when needed

## 🤝 Contributing

1. Make your changes
2. Run `npm run lint` to ensure code quality
3. Test your changes in development mode
4. Build and test the production build before committing

## 📄 License

This project is private and proprietary.
