// MyPostings.tsx - Component for employers to view their submitted job postings
// Shows job status (pending, approved, denied) from the admin review process

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Interface representing an employer's job posting
 * Contains status field that reflects admin approval status
 */
interface JobPosting {
  id: string;              // Unique job identifier
  title: string;           // Job title
  company: string;         // Company name
  location: string;        // Job location
  type: string;            // Job type (Full-time, Part-time, etc.)
  salary: string;          // Salary information
  description: string;     // Job description
  requirements: string[];  // List of job requirements
  status: 'pending' | 'approved' | 'denied'; // Current review status from admin
  createdAt: string;       // When the job was created
}

/**
 * Component that displays a job posting card with status indicator
 * Shows different styling based on job approval status
 */
const JobCard = ({ job }: { job: JobPosting }) => {
  /**
   * Returns style and icon based on job status
   * @param status - Current job status (pending, approved, denied)
   * @returns Object with styling classes and icon for the status badge
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'denied':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: null
        };
    }
  };

  const status = getStatusColor(job.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
              {status.icon}
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {job.company}
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {job.type}
            </div>
          </div>
          
          <p className="text-gray-600 line-clamp-2 mb-2">{job.description}</p>
          
          {job.status === 'pending' && (
            <p className="text-sm text-yellow-600 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Waiting for admin approval
            </p>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Posted on {new Date(job.createdAt).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * MyPostings Component
 * Allows employers to view and manage their submitted job postings
 * Shows status of each job (pending review, approved, denied)
 */
const MyPostings = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);     // List of employer's job postings
  const [loading, setLoading] = useState(true);          // Loading state
  const [error, setError] = useState('');               // Error message

  const { currentUser } = useAuth();                     // Current logged in user

  /**
   * Fetches all job postings created by the current employer
   * Shows all jobs regardless of status (pending, approved, denied)
   */
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        if (!currentUser) return;

        // Query jobs collection for all jobs created by this employer
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('employerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        // Process job data for display
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert requirements string to array for easier rendering
          requirements: doc.data().requirements?.split('\n').filter(Boolean) || []
        })) as JobPosting[];

        setJobs(jobsData);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load your job postings');
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary-600 font-medium">Loading your postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-900 mb-2"
              >
                My Job Postings
              </motion.h1>
              <p className="text-gray-600">Manage and track your job listings</p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link
                to="/submit-posting"
                className="btn-primary flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Post New Job
              </Link>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center p-4 rounded-lg bg-red-50 border border-red-100 text-red-600"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </motion.div>
          )}

          {/* Job Listings */}
          <div className="space-y-4">
            <AnimatePresence>
              {jobs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl"
                >
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Job Postings Yet</h3>
                  <p className="text-gray-500 mb-6">Start by creating your first job posting</p>
                  <Link
                    to="/submit-posting"
                    className="btn-primary inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Job Posting
                  </Link>
                </motion.div>
              ) : (
                jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPostings;
