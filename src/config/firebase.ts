// Firebase configuration and setup for CareerBridge application
// Provides authentication, database, and storage functionality

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // For user authentication
import { getFirestore } from 'firebase/firestore'; // For database operations

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBh67XJLxCzoJMaSOUpT0SiMVCA4j0Ohts",
  authDomain: "career-a50b1.firebaseapp.com",
  projectId: "career-a50b1",
  storageBucket: "career-a50b1.appspot.com",
  messagingSenderId: "821323331638",
  appId: "1:821323331638:web:4ec8fc8d7f72d445784097",
  measurementId: "G-4MB8CM260J"
};

// Initialize Firebase and export services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Authentication service
export const db = getFirestore(app); // Firestore database service

// Collection names for Firestore database
// These strings are used throughout the app to reference database collections
export const COLLECTIONS = {
  USERS: 'users',      // User accounts (admin, employer, student)
  JOBS: 'jobs',        // Job postings
  APPLICATIONS: 'applications', // Student job applications
} as const;

// User role types in the system
// Different roles have different permissions and UI experiences
export const ROLES = {
  ADMIN: 'admin',      // Can approve/reject jobs and manage users
  EMPLOYER: 'employer', // Can post jobs and manage applications
  STUDENT: 'student',  // Can browse jobs and submit applications
} as const;

// Job posting status values
// Controls job visibility in listings and admin approval workflow
export const JOB_STATUS = {
  PENDING: 'pending',   // Newly created job awaiting admin approval
  APPROVED: 'approved', // Job approved by admin and visible to students
  REJECTED: 'rejected', // Job rejected by admin and not visible to students
} as const;

// Application status values
// Controls application workflow and visibility
export const APPLICATION_STATUS = {
  PENDING: 'pending',   // Application submitted but not yet reviewed
  ACCEPTED: 'accepted', // Application accepted by employer
  REJECTED: 'rejected', // Application rejected by employer
} as const;

// Type definitions for role, status, and document types
// These provide TypeScript type safety throughout the application

// Type aliases for the string literal union types
export type UserRole = typeof ROLES[keyof typeof ROLES];
export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];
export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

/**
 * User document structure in Firestore
 * Contains common fields for all user types and role-specific fields
 */
export interface UserDocument {
  uid: string;      // User ID (from Firebase Auth)
  email: string;    // User email address
  name: string;     // User full name
  phone: string;    // User phone number
  role: UserRole;   // User role (admin, employer, student)
  createdAt: string; // Timestamp when user was created
  company?: string;  // Company name (only for employers)
}

/**
 * Job posting document structure in Firestore
 * Contains all job details and metadata for the job approval workflow
 */
export interface JobDocument {
  id: string;         // Job ID
  title: string;      // Job title
  company: string;    // Company offering the job
  location: string;   // Job location
  description: string; // Detailed job description
  requirements: string; // Job requirements
  salary: string;     // Salary information
  type: string;       // Job type (full-time, part-time, etc.)
  employerId: string; // ID of employer who created the posting
  status: JobStatus;  // Current status (pending, approved, rejected)
  createdAt: string;  // Timestamp when job was created
  updatedAt: string;  // Timestamp when job was last updated
}

/**
 * Application document structure in Firestore
 * Links students to jobs they've applied for
 */
export interface ApplicationDocument {
  id: string;          // Application ID
  jobId: string;       // ID of the job being applied for
  studentId: string;   // ID of student applicant
  employerId: string;  // ID of employer offering the job
  status: ApplicationStatus; // Current status (pending, accepted, rejected)
  resume: string;      // URL to uploaded resume
  coverLetter?: string; // Optional URL to uploaded cover letter
  createdAt: string;   // Timestamp when application was created
  updatedAt: string;   // Timestamp when application was last updated
}
