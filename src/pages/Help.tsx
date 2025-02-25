import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMail, FiMessageCircle, FiPhone } from 'react-icons/fi';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Account Management",
    question: "How do I create an account?",
    answer: "Click the 'Sign Up' button in the navigation bar. Choose your role (Student or Employer), fill in your details, and create your account. Students will need to provide their name, email, and phone number. Employers will also need to provide their company name."
  },
  {
    category: "Account Management",
    question: "Can I change my account type?",
    answer: "Account types (Student/Employer) cannot be changed after registration. If you need to change your account type, please contact our support team."
  },
  {
    category: "Account Management",
    question: "How do I update my profile?",
    answer: "Click on your profile picture in the navigation bar and select 'Settings'. Here you can update your personal information, notification preferences, and account settings."
  },
  {
    category: "For Employers",
    question: "How do I post a job?",
    answer: "Once logged in as an employer, click on 'Post Job' in the navigation menu. Fill in the job details including title, description, requirements, and salary information. Your job posting will be reviewed by our administrators before being published."
  },
  {
    category: "For Employers",
    question: "How do I manage my job postings?",
    answer: "Access your dashboard and click on 'My Postings'. Here you can view, edit, or delete your job postings. You can also see the applications received for each posting."
  },
  {
    category: "For Students",
    question: "How do I apply for a job?",
    answer: "Browse the job listings and click on any job that interests you. On the job details page, click the 'Apply' button. You'll need to upload your resume and optionally include a cover letter. Track your application status in your dashboard."
  },
  {
    category: "For Students",
    question: "How can I track my applications?",
    answer: "Go to your dashboard and click on 'My Applications'. Here you can see all your submitted applications and their current status (Pending, Accepted, or Rejected)."
  },
  {
    category: "Privacy & Security",
    question: "Is my personal information secure?",
    answer: "Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your personal information with third parties without your consent."
  }
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => 
    Array.from(new Set(faqs.map(faq => faq.category))),
    []
  );

  const filteredFaqs = useMemo(() => {
    let filtered = faqs;
    
    if (selectedCategory) {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white w-full">
      <div className="w-full px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <div className="relative max-w-2xl mx-auto">
            <FiSearch className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${!selectedCategory 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-12">
          <div className="px-6 py-8">
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-gray-200 pb-4"
                >
                  <motion.button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex justify-between items-center text-left focus:outline-none group"
                  >
                    <span className="text-lg font-medium text-gray-900 group-hover:text-green-600">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      className="ml-6 flex-shrink-0 text-gray-400"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.span>
                  </motion.button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4"
                      >
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Still need help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.a
                href="mailto:support@careerbridge.com"
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiMail className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 text-center">support@careerbridge.com</p>
              </motion.a>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-lg"
              >
                <FiPhone className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Support</h3>
                <p className="text-gray-600 text-center">1-800-CAREER-1</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-lg"
              >
                <FiMessageCircle className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 text-center">Available 24/7</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
