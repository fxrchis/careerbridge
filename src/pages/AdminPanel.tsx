// AdminPanel.tsx - Main administrative interface component for site management
// Provides tabs for user management, job approval workflow, and employer account creation

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiBriefcase, 
  FiUserPlus, 
  FiCheck, 
  FiX,
  FiAlertTriangle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiHome as FiBuilding
} from 'react-icons/fi';
import { createUser, updateJob } from '../utils/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS, ROLES, JOB_STATUS, UserDocument, JobDocument } from '../config/firebase';

const AdminPanel = () => {
  // Track which tab is currently active in the admin panel (users, jobs, or create)  
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'create'>('users');
  // Store list of all users from Firestore
  const [users, setUsers] = useState<UserDocument[]>([]);
  // Store list of jobs that need admin approval (status: pending)
  const [pendingJobs, setPendingJobs] = useState<JobDocument[]>([]);
  // Overall loading state for the component
  const [loading, setLoading] = useState(true);
  // Track loading state for individual job approval/rejection actions
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  // Form data for creating new employer accounts
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: ''
  });

  // Fetch all users and pending jobs when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetches both users and jobs data from Firestore database
   * - Gets all users for the User Management tab
   * - Gets all jobs and filters for pending ones that need admin approval
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch all users from the database
      const usersQuery = query(collection(db, COLLECTIONS.USERS));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ 
        uid: doc.id, // Use document ID as the user ID
        ...doc.data() // Spread all other user data fields
      })) as UserDocument[];
      setUsers(usersData);
      
      // 2. Fetch ALL jobs and filter for pending ones in memory
      // Note: This approach avoids Firestore composite index requirements
      const allJobsRef = collection(db, COLLECTIONS.JOBS);
      const allJobsQuery = query(allJobsRef, orderBy('createdAt', 'desc')); // Newest first
      const allJobsSnapshot = await getDocs(allJobsQuery);
      const allJobs = allJobsSnapshot.docs.map(doc => ({
        id: doc.id, // Use document ID as the job ID
        ...(doc.data() as Omit<JobDocument, 'id'>) // Spread all other job data fields
      })) as JobDocument[];
      
      // 3. Filter out only jobs with pending status
      // Case-insensitive matching ensures we catch all pending jobs regardless of capitalization
      const pendingJobs = allJobs.filter(job => 
        job.status?.toLowerCase() === JOB_STATUS.PENDING.toLowerCase()
      );
      
      console.log(`Found ${pendingJobs.length} pending jobs out of ${allJobs.length} total jobs`);
      setPendingJobs(pendingJobs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles job approval or rejection actions by admin
   * @param jobId - The ID of the job to update
   * @param status - The new status for the job (approved or rejected)
   */
  const handleJobAction = async (jobId: string, status: typeof JOB_STATUS[keyof typeof JOB_STATUS]) => {
    // Show loading spinner for this specific job
    setActionLoading(prev => ({ ...prev, [jobId]: true }));
    
    try {
      // Update job status in Firestore database
      await updateJob(jobId, { status });
      // Remove the job from the pending jobs list immediately after action
      setPendingJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      // Hide loading spinner when done
      setActionLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  /**
   * Creates a new employer account in the system
   * @param e - The form submission event
   */
  const handleCreateEmployer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a new user with employer role in Firestore
      await createUser(formData.email, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: ROLES.EMPLOYER, // Assign employer role to the user
        company: formData.company,
        createdAt: new Date().toISOString()
      });
      // Reset form fields after successful creation
      setFormData({ name: '', email: '', phone: '', company: '', password: '' });
      // Refresh data to update user list
      await fetchData();
    } catch (error) {
      console.error('Error creating employer:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'users' as const, label: 'User Management', icon: FiUsers },
    { id: 'jobs' as const, label: 'Job Approvals', icon: FiBriefcase },
    { id: 'create' as const, label: 'Create Employer', icon: FiUserPlus }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-base sm:text-lg text-gray-600">Manage users, approve jobs, and create employer accounts</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <nav className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 p-4">
              {tabs.map(tab => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 sm:px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                  <div className="h-full w-full rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-green-700 font-medium text-sm">
                                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3 sm:ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="hidden sm:table-cell px-6 py-4">
                              <div className="text-sm text-gray-900 flex items-center">
                                <FiPhone className="mr-2" />
                                {user.phone}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                                user.role === ROLES.ADMIN ? 'bg-purple-100 text-purple-800' :
                                user.role === ROLES.EMPLOYER ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="hidden sm:table-cell px-6 py-4">
                              <div className="text-sm text-gray-900 flex items-center">
                                <FiBuilding className="mr-2" />
                                {user.company || '-'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'jobs' && (
                <motion.div
                  key="jobs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Job Approvals</h3>
                    
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : pendingJobs.length === 0 ? (
                      <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <FiAlertTriangle className="mx-auto text-gray-400 w-12 h-12 mb-4" />
                        <h4 className="text-xl font-medium text-gray-700 mb-2">No Pending Jobs</h4>
                        <p className="text-gray-500">All job postings have been reviewed. Check back later for new submissions.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {pendingJobs.map((job) => (
                          <div key={job.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-5">
                              <div className="flex justify-between mb-4">
                                <div>
                                  <h4 className="text-xl font-semibold text-gray-800">{job.title}</h4>
                                  <p className="text-gray-600">{job.company}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-500 block">Location</span>
                                  <span className="flex items-center text-gray-700">
                                    <FiMapPin className="mr-1" /> {job.location}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500 block">Type</span>
                                  <span className="text-gray-700">{job.type}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500 block">Salary</span>
                                  <span className="flex items-center text-gray-700">
                                    <FiDollarSign className="mr-1" /> {job.salary}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500 block">Employer ID</span>
                                  <span className="text-gray-700 font-mono text-xs">{job.employerId}</span>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-500 mb-2">Description</h5>
                                <p className="text-gray-700 text-sm line-clamp-3">{job.description}</p>
                              </div>
                              
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-500 mb-2">Requirements</h5>
                                <p className="text-gray-700 text-sm line-clamp-3">{job.requirements}</p>
                              </div>
                              
                              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                                <button 
                                  onClick={() => handleJobAction(job.id, JOB_STATUS.REJECTED)}
                                  disabled={actionLoading[job.id]}
                                  className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                  {actionLoading[job.id] ? (
                                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : <FiX className="mr-2 h-4 w-4" />}
                                  Reject Job
                                </button>
                                <button 
                                  onClick={() => handleJobAction(job.id, JOB_STATUS.APPROVED)} 
                                  disabled={actionLoading[job.id]}
                                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                  {actionLoading[job.id] ? (
                                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : <FiCheck className="mr-2 h-4 w-4" />}
                                  Approve Job
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'create' && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Create Employer Account</h2>
                    <form onSubmit={handleCreateEmployer} className="space-y-6">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <FiUsers className="mr-2" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow text-sm sm:text-base"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <FiMail className="mr-2" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow text-sm sm:text-base"
                          placeholder="Enter email address"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <FiPhone className="mr-2" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow text-sm sm:text-base"
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <FiBuilding className="mr-2" />
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow text-sm sm:text-base"
                          placeholder="Enter company name"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <FiUsers className="mr-2" />
                          Password
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow text-sm sm:text-base"
                          placeholder="Enter password"
                        />
                      </div>

                      <div className="pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading}
                          className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <FiUserPlus className="w-5 h-5 mr-2" />
                              Create Employer Account
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
