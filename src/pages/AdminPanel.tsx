import { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth, ROLES } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newEmployer, setNewEmployer] = useState({
    email: '',
    password: '',
    companyName: '',
    contactPerson: '',
    phoneNumber: '',
    employerName: '',
  });
  const [selectedTab, setSelectedTab] = useState('users');
  const [jobs, setJobs] = useState<any[]>([]);

  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchUsers();
    fetchJobs();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      console.log('Fetching jobs for admin panel...');
      const jobsRef = collection(db, 'jobs');
      const querySnapshot = await getDocs(jobsRef);
      const jobsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Job data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      });
      setJobs(jobsData);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs');
    }
  };

  const createEmployerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newEmployer.email || !newEmployer.password || !newEmployer.companyName || 
        !newEmployer.employerName || !newEmployer.phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmployer.email,
        newEmployer.password
      );

      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newEmployer.email,
        role: ROLES.EMPLOYER,
        companyName: newEmployer.companyName,
        employerName: newEmployer.employerName,
        phoneNumber: newEmployer.phoneNumber,
        contactPerson: newEmployer.contactPerson || null,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.uid,
      });

      setSuccess('Employer account created successfully!');
      setNewEmployer({
        email: '',
        password: '',
        companyName: '',
        contactPerson: '',
        phoneNumber: '',
        employerName: '',
      });
      fetchUsers();
    } catch (err: any) {
      console.error('Error creating employer account:', err);
      setError(err.message || 'Failed to create employer account');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'bg-red-100 text-red-800';
      case ROLES.EMPLOYER:
        return 'bg-blue-100 text-blue-800';
      case ROLES.STUDENT:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleJobAction = async (jobId: string, action: 'approve' | 'delete') => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      
      if (action === 'approve') {
        console.log('Approving job:', jobId);
        const updateData = {
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: currentUser?.uid
        };
        console.log('Update data:', updateData);
        await updateDoc(jobRef, updateData);
        setSuccess('Job posting approved successfully!');
      } else {
        console.log('Deleting job:', jobId);
        await deleteDoc(jobRef);
        setSuccess('Job posting deleted successfully!');
      }
      
      fetchJobs();
    } catch (err) {
      console.error(`Error ${action}ing job:`, err);
      setError(`Failed to ${action} job posting`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
                <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
                <p className="text-sm">{success}</p>
              </div>
            )}

            <div className="mb-8">
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setSelectedTab('users')}
                  className={`px-4 py-2 rounded-md ${
                    selectedTab === 'users'
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Manage Users
                </button>
                <button
                  onClick={() => setSelectedTab('jobs')}
                  className={`px-4 py-2 rounded-md ${
                    selectedTab === 'jobs'
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Manage Jobs
                </button>
                <button
                  onClick={() => setSelectedTab('employers')}
                  className={`px-4 py-2 rounded-md ${
                    selectedTab === 'employers'
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Create Employer
                </button>
              </div>

              {selectedTab === 'employers' && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Employer Account</h3>
                  <form onSubmit={createEmployerAccount} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="employerName" className="block text-sm font-medium text-gray-700">
                          Employer Name *
                        </label>
                        <input
                          type="text"
                          id="employerName"
                          value={newEmployer.employerName}
                          onChange={(e) => setNewEmployer({ ...newEmployer, employerName: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          value={newEmployer.companyName}
                          onChange={(e) => setNewEmployer({ ...newEmployer, companyName: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={newEmployer.email}
                          onChange={(e) => setNewEmployer({ ...newEmployer, email: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          value={newEmployer.phoneNumber}
                          onChange={(e) => setNewEmployer({ ...newEmployer, phoneNumber: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password *
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={newEmployer.password}
                          onChange={(e) => setNewEmployer({ ...newEmployer, password: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                          Additional Contact Person
                        </label>
                        <input
                          type="text"
                          id="contactPerson"
                          value={newEmployer.contactPerson}
                          onChange={(e) => setNewEmployer({ ...newEmployer, contactPerson: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create Employer Account
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {selectedTab === 'users' && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Users</h3>
                  <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Role
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                  <span className="sr-only">Actions</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {users.map((user) => (
                                <tr key={user.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                      {user.role}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'jobs' && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Jobs</h3>
                  <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Position
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Company
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Posted Date
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                  <span className="sr-only">Actions</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {jobs.map((job) => (
                                <tr key={job.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                    <div className="text-sm text-gray-500">{job.type}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{job.company}</div>
                                    <div className="text-sm text-gray-500">{job.location}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      job.status === 'approved' 
                                        ? 'bg-green-100 text-green-800' 
                                        : job.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {job.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {job.status === 'pending' && (
                                      <div className="flex space-x-2 justify-end">
                                        <button
                                          onClick={() => handleJobAction(job.id, 'approve')}
                                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                          </svg>
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleJobAction(job.id, 'delete')}
                                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                          </svg>
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                    {job.status === 'approved' && (
                                      <button
                                        onClick={() => handleJobAction(job.id, 'delete')}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                      >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                        Delete
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
