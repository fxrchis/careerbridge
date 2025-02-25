import { motion } from 'framer-motion';
import { FiGithub } from 'react-icons/fi';

const JudgesAccess = () => {
  const projectLinks = [
    {
      title: 'Project Repository',
      description: 'Access the complete source code and project files',
      icon: FiGithub,
      url: 'https://github.com/fxrchis/careerbridge',
      buttonText: 'View Repository'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">FBLA Judges Access</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to CareerBridge! Here you'll find all the resources needed to evaluate our project.
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-8">
          {projectLinks.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center"
            >
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <link.icon className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{link.title}</h2>
              <p className="text-gray-600 mb-6 flex-grow">{link.description}</p>
              <motion.a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {link.buttonText}
              </motion.a>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              CareerBridge is a comprehensive job application platform designed to connect students with employers. 
              The platform features three distinct user roles:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Students:</strong> Can browse and apply for jobs, track applications, and manage their profiles</li>
              <li><strong>Employers:</strong> Can post job opportunities, review applications, and manage their listings</li>
              <li><strong>Administrators:</strong> Have full control over the platform, including user management and content moderation</li>
            </ul>
            <p className="text-gray-600 mt-4">
              The project is built using modern web technologies including React, TypeScript, and Firebase, 
              ensuring a scalable, secure, and user-friendly experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgesAccess;
