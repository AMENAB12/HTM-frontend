# CSV File Manager Frontend

A modern React frontend application built with Next.js and Zustand for managing CSV file uploads with real-time processing status.

## Features

- **Authentication System**: Simple login with username/password validation
- **File Upload**: Drag-and-drop CSV file upload with validation
- **Real-time Status**: Live status updates (Processing → Error/Done)
- **File Management**: Table view showing all uploaded files with metadata
- **Responsive Design**: Modern UI built with Tailwind CSS

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS
- **File Upload**: React Dropzone
- **Date Formatting**: date-fns
- **Language**: TypeScript

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on http://localhost:8000

## Installation

1. **Clone and navigate to the project:**

   ```bash
   cd HTM-frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Update `NEXT_PUBLIC_API_URL` if your backend runs on a different port.

## Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Login Credentials

Use the following credentials to log in:

- **Username**: `test`
- **Password**: `password`

## Usage

1. **Login**: Enter the credentials on the login page
2. **Upload Files**:
   - Click the upload area or drag CSV files into it
   - Files immediately show "Processing" status
   - After 3 seconds, status updates to "Error" (0 rows) or "Done" (>0 rows)
3. **View Files**: All uploaded files are displayed in a table with:
   - File name
   - Upload timestamp
   - Current status (with visual indicators)
   - Row count (when available)
4. **Logout**: Click the logout button to return to login screen

## API Integration

The frontend expects a backend with the following endpoints:

- `POST /login` - Authentication endpoint
- `POST /upload` - File upload endpoint (multipart/form-data)
- `GET /files` - Retrieve file metadata

All protected endpoints require an `Authorization: Bearer <token>` header.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page with auth routing
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── LoginForm.tsx   # Authentication form
│   ├── FileUpload.tsx  # File upload with drag-and-drop
│   ├── FileList.tsx    # File table display
│   └── Dashboard.tsx   # Main dashboard layout
├── lib/                # Utilities
│   └── api.ts          # API communication functions
└── store/              # State management
    └── useStore.ts     # Zustand store configuration
```

## Build for Production

```bash
npm run build
npm start
```

## Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Ensure responsive design
4. Test authentication and file upload flows

## License

This project is part of a technical assessment and is for demonstration purposes.
