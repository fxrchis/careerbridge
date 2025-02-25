// Import required dependencies and components
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Home = () => {
  // Platform features data
  const features = [
    {
      title: 'Easy Job Search',
      description: 'Find relevant job opportunities tailored for high school students',
      icon: '🔍',
    },
    {
      title: 'Direct Applications',
      description: 'Apply directly to jobs through our platform',
      icon: '📝',
    },
    {
      title: 'Employer Connections',
      description: 'Connect with local employers looking for young talent',
      icon: '🤝',
    },
    {
      title: 'Career Growth',
      description: 'Start building your career path early',
      icon: '📈',
    },
  ];

  // Step-by-step process explanation
  const howItWorks = [
    {
      title: 'Create Your Profile',
      description: 'Sign up and create your student profile with your skills and interests',
      icon: '👤',
    },
    {
      title: 'Browse Opportunities',
      description: 'Explore job postings from local businesses and organizations',
      icon: '🔎',
    },
    {
      title: 'Apply with Ease',
      description: 'Submit applications directly through our platform',
      icon: '✉️',
    },
    {
      title: 'Get Hired',
      description: 'Connect with employers and start your career journey',
      icon: '🎯',
    },
  ];

  // User testimonials and success stories
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'High School Student',
      image: '/images/girl1.png',
      content: 'CareerBridge helped me find my first part-time job! The process was so simple and straightforward.',
    },
    {
      name: 'Mike Brown',
      role: 'Local Business Owner',
      image: '/images/owner.png',
      content: 'As an employer, I love how easy it is to connect with motivated young talent in our community.',
    },
    {
      name: 'Emily Chen',
      role: 'High School Junior',
      image: '/images/girl2.png',
      content: 'Thanks to CareerBridge, I found an amazing internship that aligns with my career goals.',
    },
  ];

  // Impact statistics
  const impactStats = [
    { number: 'Helped Students', label: '' },
    { number: 'Partnered Employers', label: '' },
    { number: 'Job Opportunities', label: '' },
    { number: 'Thriving Communities', label: '' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero section with animated background */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        {/* Gradient background with grid pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800">
          <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid-8" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Main hero content and CTA buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-32">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Launch Your Career Journey Today
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-primary-50"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Connecting ambitious high school students with meaningful job opportunities
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/jobs"
                className="button-gradient inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg text-white shadow-lg hover:shadow-xl transition-all group"
              >
                Explore Jobs
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg text-white border-2 border-white/20 hover:bg-white/10 transition-all"
              >
                Sign Up Now
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-primary-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </motion.section>

      {/* Features section with animated cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">Why Choose CareerBridge?</h2>
            <p className="text-xl text-gray-600">Empowering students to build their future careers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-effect rounded-xl p-6 card-hover"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gradient">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process explanation with connected steps */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">How It Works</h2>
            <p className="text-xl text-gray-600">Your journey to success starts here</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.title}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="glass-effect rounded-xl p-6 card-hover relative z-10">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gradient">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-primary-500 to-transparent transform -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with user stories */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">Success Stories</h2>
            <p className="text-xl text-gray-600">Hear from our community members</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="glass-effect rounded-xl p-8 card-hover"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gradient">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact statistics */}
      <section className="py-24 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-primary-100">Making a difference in students' lives and local businesses</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action section */}
      <section className="py-24 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 text-primary-100">Join CareerBridge today and discover amazing opportunities</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/auth"
                className="button-gradient inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg text-white shadow-lg hover:shadow-xl transition-all group"
              >
                Sign Up Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
