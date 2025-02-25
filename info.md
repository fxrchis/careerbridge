## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Firebase (Authentication & Database)
- React Router DOM
- Framer Motion
- React Hook Form
- Heroicons

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd careerbridge
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and update the configuration:
   - Create a new project in Firebase Console
   - Enable Authentication and Firestore
   - Copy your Firebase configuration
   - Update the configuration in `src/config/firebase.ts`

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
careerbridge/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── config/        # Configuration files
│   ├── types/         # TypeScript type definitions
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── package.json       # Project dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
