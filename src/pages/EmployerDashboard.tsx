import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db, JobDocument } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState<JobDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchEmployerJobs();
    }
  }, [currentUser]);

  const fetchEmployerJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(
        jobsRef,
        where('employerId', '==', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as JobDocument[];
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching employer jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">My Job Postings</h2>
              <Link
                to="/submit-posting"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
              >
                Post a New Job
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">You haven't posted any jobs yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{job.company}</p>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-gray-500">Location: {job.location}</p>
                          <p className="text-sm text-gray-500">Salary: {job.salary}</p>
                          <p className="text-sm text-gray-500">Type: {job.type}</p>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900">Description:</h4>
                          <p className="text-gray-600 mt-1">{job.description}</p>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900">Requirements:</h4>
                          <p className="text-gray-600 mt-1">{job.requirements}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                      <Link
                        to={`/applications/${job.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                      >
                        View Applications
                      </Link>
                      <Link
                        to={`/edit-posting/${job.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        Edit Posting
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
