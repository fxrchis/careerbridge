import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string;
}

interface ApplicationForm {
  fullName: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  experience: string;
  coverLetter: string;
  availability: string;
  references: string;
}

const StudentApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationForm>();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    fetchJobDetails();
  }, [jobId, currentUser]);

  const fetchJobDetails = async () => {
    try {
      if (!jobId) return;
      
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (jobDoc.exists()) {
        setJob({ id: jobDoc.id, ...jobDoc.data() } as JobPosting);
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
    }
  };

  const onSubmit = async (data: ApplicationForm) => {
    if (!currentUser || !job) return;

    setSubmitting(true);

    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where('jobId', '==', jobId),
        where('userId', '==', currentUser.uid)
      );
      const existingApps = await getDocs(q);

      if (!existingApps.empty) {
        navigate('/applications');
        return;
      }

      const applicationData = {
        ...data,
        jobId,
        userId: currentUser.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary
      };

      await addDoc(collection(db, 'applications'), applicationData);
      navigate('/applications');
    } catch (err) {
      console.error('Error submitting application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
            <p className="mt-2 text-gray-600">The job posting you're looking for doesn't exist or has been removed.</p>
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
              <p className="mt-1 text-lg text-gray-600">{job.company}</p>
              <div className="mt-2 flex flex-wrap gap-4">
                <span className="text-sm text-gray-500">{job.location}</span>
                <span className="text-sm text-gray-500">{job.type}</span>
                <span className="text-sm text-gray-500">{job.salary}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    {...register('fullName', { required: 'Full name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone number is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">School</label>
                  <input
                    type="text"
                    {...register('school', { required: 'School is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.school && (
                    <p className="mt-1 text-sm text-red-600">{errors.school.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade/Year</label>
                  <input
                    type="text"
                    {...register('grade', { required: 'Grade/Year is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.grade && (
                    <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <input
                    type="text"
                    {...register('availability', { required: 'Availability is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Immediate, 2 weeks notice"
                  />
                  {errors.availability && (
                    <p className="mt-1 text-sm text-red-600">{errors.availability.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Experience</label>
                <textarea
                  {...register('experience', { required: 'Experience is required' })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe your relevant experience..."
                />
                {errors.experience && (
                  <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Letter</label>
                <textarea
                  {...register('coverLetter', { required: 'Cover letter is required' })}
                  rows={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Write your cover letter..."
                />
                {errors.coverLetter && (
                  <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">References</label>
                <textarea
                  {...register('references')}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="List your references (optional)..."
                />
              </div>

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                    submitting ? 'bg-blue-400' : 'bg-blue-800 hover:bg-blue-900'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentApply;
