import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';

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
  education: string;
  school: string;
  gradYear: string;
  experience: string;
  skills: string;
  availability: string;
  coverLetter: string;
}

const StudentApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register, handleSubmit: handleFormSubmit, formState: { errors } } = useForm<ApplicationForm>();

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
      setError('Failed to load job details');
    }
  };

  const onSubmit = async (data: ApplicationForm) => {
    if (!currentUser || !job) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where('jobId', '==', jobId),
        where('userId', '==', currentUser.uid)
      );
      const existingApps = await getDocs(q);

      if (!existingApps.empty) {
        setError('You have already applied for this position');
        setSubmitting(false);
        return;
      }
      
      // Get employer ID from the job document
      const jobRef = doc(db, 'jobs', jobId!);
      const jobDoc = await getDoc(jobRef);
      const employerId = jobDoc.data()?.userId || jobDoc.data()?.employerId;

      const applicationData = {
        jobId,
        userId: currentUser.uid,
        employerId: employerId, // Add employer ID to connect applications to employers
        status: 'pending',
        createdAt: new Date().toISOString(),
        jobTitle: job.title,
        company: job.company,
        ...data,
        appliedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'applications'), applicationData);
      setSuccess('Application submitted successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/my-applications');
      }, 2000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Job Header */}
          <div className="bg-primary-600 px-6 py-8 text-white">
            <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
            <div className="flex items-center text-primary-100 mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4m-4-4v8m-12 4h.02" />
              </svg>
              {job.company}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.salary}
              </div>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleFormSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register('fullName', { required: 'Full name is required' })}
                    type="text"
                    id="fullName"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    id="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    type="tel"
                    id="phone"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                    Availability *
                  </label>
                  <select
                    {...register('availability', { required: 'Availability is required' })}
                    id="availability"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select availability</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Weekends">Weekends only</option>
                    <option value="Evenings">Evenings only</option>
                    <option value="Summers">Summer only</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                  {errors.availability && (
                    <p className="text-red-500 text-xs mt-1">{errors.availability.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level *
                  </label>
                  <select
                    {...register('education', { required: 'Education level is required' })}
                    id="education"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select education level</option>
                    <option value="Freshman">High School Freshman</option>
                    <option value="Sophomore">High School Sophomore</option>
                    <option value="Junior">High School Junior</option>
                    <option value="Senior">High School Senior</option>
                    <option value="College">College Student</option>
                    <option value="Graduate">High School Graduate</option>
                  </select>
                  {errors.education && (
                    <p className="text-red-500 text-xs mt-1">{errors.education.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                    School/Institution *
                  </label>
                  <input
                    {...register('school', { required: 'School name is required' })}
                    type="text"
                    id="school"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your school name"
                  />
                  {errors.school && (
                    <p className="text-red-500 text-xs mt-1">{errors.school.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="gradYear" className="block text-sm font-medium text-gray-700 mb-1">
                    Graduation Year *
                  </label>
                  <input
                    {...register('gradYear', { required: 'Graduation year is required' })}
                    type="text"
                    id="gradYear"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Expected graduation year"
                  />
                  {errors.gradYear && (
                    <p className="text-red-500 text-xs mt-1">{errors.gradYear.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Experience & Skills Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Experience & Skills</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Work/Volunteer Experience
                  </label>
                  <textarea
                    {...register('experience')}
                    id="experience"
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe your previous work or volunteer experience (if any)"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Skills & Qualifications *
                  </label>
                  <textarea
                    {...register('skills', { required: 'Skills are required' })}
                    id="skills"
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="List your relevant skills, certifications, or qualifications"
                  ></textarea>
                  {errors.skills && (
                    <p className="text-red-500 text-xs mt-1">{errors.skills.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Letter / Additional Information
                  </label>
                  <textarea
                    {...register('coverLetter')}
                    id="coverLetter"
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell us why you're interested in this position and why you would be a good fit"
                  ></textarea>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            {success && (
              <div className="text-green-600 text-sm">{success}</div>
            )}

            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentApply;
