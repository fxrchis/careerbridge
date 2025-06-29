// SubmitPosting.tsx - Component for employers to submit new job postings
// New job postings start with 'pending' status and require admin approval

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiDollarSign, FiFileText, FiList } from 'react-icons/fi';
import { createJob } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * SubmitPosting Component
 * Allows employers to create new job postings that will be sent for admin approval
 */
const SubmitPosting = () => {
  const navigate = useNavigate(); // For redirecting after submission
  const { currentUser } = useAuth(); // Get logged-in user info
  const [loading, setLoading] = useState(false); // Track form submission state
  
  // Form data for new job posting
  const [formData, setFormData] = useState({
    title: '',         // Job title
    company: '',       // Company name
    location: '',      // Job location
    type: 'Full-time', // Job type (default: Full-time)
    salary: '',        // Salary range
    description: '',   // Detailed job description
    requirements: '',  // Job requirements (stored as string in form, converted to array on submit)
  });

  /**
   * Handles job posting form submission
   * Creates a new job with 'pending' status that requires admin approval
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Show loading indicator

    try {
      // Verify user is logged in
      if (!currentUser) throw new Error('Must be logged in');

      // Convert requirements string to array
      const requirementsArray = formData.requirements
        ? formData.requirements.split('\n').filter(Boolean)
        : [];

      // Create new job posting in Firestore with pending status
      // The createJob function will automatically set status to 'pending'
      await createJob({
        ...formData,
        requirements: requirementsArray, // Pass requirements as array
        employerId: currentUser.uid, // Link job to current user
      });

      // Redirect to My Postings page after successful submission
      navigate('/my-postings');
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  /**
   * Updates form state when any input field changes
   * @param e - Input change event from any form field
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value })); // Update only the changed field
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
              <p className="mt-2 text-gray-600">Fill out the form below to create a new job posting</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <FiBriefcase className="mr-2" />
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <FiBriefcase className="mr-2" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Tech Solutions Inc."
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <FiMapPin className="mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., New York, NY"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="mr-2" />
                      Employment Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <FiDollarSign className="mr-2" />
                      Salary Range
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., $50,000 - $70,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <FiFileText className="mr-2" />
                    Job Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <FiList className="mr-2" />
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="List required skills, experience, education, certifications..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Job Posting'
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

export default SubmitPosting;
