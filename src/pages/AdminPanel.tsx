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
  FiCalendar,
  FiHome as FiBuilding
} from 'react-icons/fi';
import { createUser, getPendingJobs, updateJob } from '../utils/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS, ROLES, JOB_STATUS, UserDocument, JobDocument } from '../config/firebase';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'create'>('users');
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [pendingJobs, setPendingJobs] = useState<JobDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersQuery = query(collection(db, COLLECTIONS.USERS));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data() 
      })) as UserDocument[];
      setUsers(usersData);

      const pendingJobsData = await getPendingJobs();
      setPendingJobs(pendingJobsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = async (jobId: string, status: typeof JOB_STATUS[keyof typeof JOB_STATUS]) => {
    try {
      await updateJob(jobId, { status });
      await fetchData();
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleCreateEmployer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser(formData.email, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: ROLES.EMPLOYER,
        company: formData.company,
        createdAt: new Date().toISOString()
      });
      setFormData({ name: '', email: '', phone: '', company: '', password: '' });
      await fetchData();
    } catch (error) {
      console.error('Error creating employer:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'jobs', label: 'Job Approvals', icon: FiBriefcase },
    { id: 'create', label: 'Create Employer', icon: FiUserPlus }
  ] as const;

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
                  {pendingJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{job.title}</h3>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <FiBuilding className="mr-2" />
                            {job.company}
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleJobAction(job.id, JOB_STATUS.APPROVED)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                          >
                            <FiCheck className="w-4 h-4 mr-2" />
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleJobAction(job.id, JOB_STATUS.REJECTED)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                          >
                            <FiX className="w-4 h-4 mr-2" />
                            Reject
                          </motion.button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                            <p className="text-sm text-gray-600">{job.description}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <FiMapPin className="mr-2" />
                              {job.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FiDollarSign className="mr-2" />
                              {job.salary}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
                            <p className="text-sm text-gray-600">{job.requirements}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <FiBriefcase className="mr-2" />
                              {job.type}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FiCalendar className="mr-2" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {pendingJobs.length === 0 && (
                    <div className="text-center py-12">
                      <FiAlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No pending jobs</h3>
                      <p className="mt-2 text-gray-500">There are no jobs waiting for approval at the moment.</p>
                    </div>
                  )}
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
