import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: string;
  resume: string;
  coverLetter: string | null;
  job?: {
    title: string;
    company: string;
    location: string;
  } | null;
  student?: {
    email: string;
    name: string;
  } | null;
}

const EmployerApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    fetchApplications();
  }, [currentUser, navigate]);

  const fetchApplications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, where('employerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const applicationsList = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const applicationData = docSnapshot.data();
          const jobDoc = await getDoc(doc(db, 'jobs', applicationData.jobId));
          const studentDoc = await getDoc(doc(db, 'users', applicationData.userId));
          
          return {
            id: docSnapshot.id,
            jobId: applicationData.jobId,
            userId: applicationData.userId,
            status: applicationData.status,
            resume: applicationData.resume,
            coverLetter: applicationData.coverLetter,
            job: jobDoc.exists() ? {
              title: jobDoc.data()?.title,
              company: jobDoc.data()?.company,
              location: jobDoc.data()?.location,
            } : null,
            student: studentDoc.exists() ? {
              email: studentDoc.data()?.email,
              name: studentDoc.data()?.name,
            } : null,
          } as Application;
        })
      );
      
      setApplications(applicationsList);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, { status: newStatus });
      
      
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status');
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
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No applications found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.job?.title || 'Job Title Not Available'}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {application.job?.company || 'Company Not Available'}
                        </p>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Location:</span>{' '}
                            {application.job?.location || 'Location Not Available'}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Applicant:</span>{' '}
                            {application.student?.name || 'Name Not Available'}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Email:</span>{' '}
                            {application.student?.email || 'Email Not Available'}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Status:</span>{' '}
                            <span className={`capitalize ${
                              application.status === 'accepted' ? 'text-green-600' :
                              application.status === 'rejected' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {application.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      {application.status === 'pending' && (
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleApplicationStatus(application.id, 'accepted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleApplicationStatus(application.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerApplications;
