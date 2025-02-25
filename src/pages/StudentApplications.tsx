import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Application {
  id: string;
  jobId: string;
  userId: string;
  jobTitle: string;
  company: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
  resume: string;
  coverLetter?: string;
  salary?: string;
  description?: string;
  experience?: string;
  availability?: string;
}

const StudentApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const applicationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Application[];

        applicationsData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setApplications(applicationsData);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load your applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser]);

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return (
          <svg className="w-5 h-5 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border-t-4 border-blue-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-blue-800 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {applications.length} {applications.length === 1 ? 'application' : 'applications'} submitted
                  </p>
                </div>
              </div>
              <Link
                to="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900"
              >
                Browse More Jobs
              </Link>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {applications.length > 0 && (
              <div className="mb-6 flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('accepted')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setFilter('rejected')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Rejected
                </button>
              </div>
            )}

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500">Start applying to jobs to see your applications here!</p>
                <Link
                  to="/jobs"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900"
                >
                  View Available Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {filteredApplications.map((application) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{application.jobTitle}</h3>
                              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(application.status)}`}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1">
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{application.company}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {application.location && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {application.location}
                                </span>
                              )}
                              {application.type && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {application.type}
                                </span>
                              )}
                              {application.salary && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {application.salary}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                              Applied on {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex flex-col space-y-2">
                            {application.resume && (
                              <a
                                href={application.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Resume
                              </a>
                            )}
                            {application.coverLetter && (
                              <a
                                href={application.coverLetter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Cover Letter
                              </a>
                            )}
                          </div>
                        </div>

                        {(application.description || application.experience || application.availability) && (
                          <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4">
                            {application.description && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">Job Description</h4>
                                <p className="mt-1 text-sm text-gray-600 line-clamp-3">{application.description}</p>
                              </div>
                            )}
                            {application.experience && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">Your Experience</h4>
                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{application.experience}</p>
                              </div>
                            )}
                            {application.availability && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">Your Availability</h4>
                                <p className="mt-1 text-sm text-gray-600">{application.availability}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentApplications;
