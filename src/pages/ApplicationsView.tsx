import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  experience: string;
  coverLetter: string;
  availability: string;
  references: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: Date;
}

const ApplicationsView = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      
      const applicationsRef = collection(db, 'applications');
      const querySnapshot = await getDocs(applicationsRef);
      
      const apps: Application[] = [];
      querySnapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() } as Application);
      });
      
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status,
        updatedAt: new Date()
      });

      
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' ? true : app.status === filter
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No applications found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.fullName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">Applied for: {application.jobTitle}</p>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900">Contact Information</h4>
                          <p className="text-gray-600">Email: {application.email}</p>
                          <p className="text-gray-600">Phone: {application.phone}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Education</h4>
                          <p className="text-gray-600">School: {application.school}</p>
                          <p className="text-gray-600">Grade: {application.grade}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900">Experience</h4>
                        <p className="text-gray-600 mt-1">{application.experience}</p>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900">Cover Letter</h4>
                        <p className="text-gray-600 mt-1">{application.coverLetter}</p>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900">Availability</h4>
                        <p className="text-gray-600 mt-1">{application.availability}</p>
                      </div>

                      {application.references && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900">References</h4>
                          <p className="text-gray-600 mt-1">{application.references}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {application.status === 'pending' && (
                    <div className="mt-6 flex space-x-4">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsView;
