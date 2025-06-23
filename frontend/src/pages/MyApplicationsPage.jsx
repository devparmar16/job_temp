import React, { useEffect } from 'react';
import { useApplications } from '../contexts/applicationContext';
import { useAuth } from '../contexts/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, MessageSquare, Briefcase, Building, MapPin, BadgeCheck, FileText } from 'lucide-react';

const MyApplicationsPage = () => {
  const { myApplications, deleteApplication, fetchMyApplications } = useApplications();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'Job Seeker') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      const result = await deleteApplication(id);
      if (result.success) {
        fetchMyApplications(); // Refresh the list
      }
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-gray-800"
      >
        My Applications
      </motion.h1>
      <div className="space-y-6">
        {myApplications.length > 0 ? myApplications.map((app, i) => {
            const job = app.jobID;
            if (!job) {
                return (
                    <motion.div
                        key={app._id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={i}
                        className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center"
                    >
                        <p className="text-gray-500">This job is no longer available.</p>
                        <button onClick={() => handleDelete(app._id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                           <Trash2 />
                        </button>
                    </motion.div>
                );
            }
            return (
              <motion.div 
                key={app._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={i}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
              >
                <div className="flex flex-col md:flex-row justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Briefcase className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {job.companyName}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.city}, {job.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`mt-4 md:mt-0 text-sm font-medium px-3 py-1 rounded-full ${getStatusChip(app.status)}`}>
                    {app.status}
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col md:flex-row items-center justify-between border-t pt-4">
                  <div className="text-lg font-semibold text-indigo-600 flex items-center gap-2">
                    <BadgeCheck className="w-6 h-6 text-indigo-500" />
                    ATS Score: {app.atsScore}%
                  </div>
                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <Link to={`/job/${job._id}`} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                        <FileText className="w-4 h-4" /> Details
                    </Link>
                    <Link to={`/chat/${app._id}`} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Chat
                    </Link>
                    <button onClick={() => handleDelete(app._id)} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                        <Trash2 className="w-4 h-4" /> Withdraw
                    </button>
                  </div>
                </div>
              </motion.div>
            );
        }) : (
            <div className="text-center py-16">
                <FileText className="mx-auto w-16 h-16 text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-800">No Applications Yet</h3>
                <p className="mt-2 text-gray-500">Once you apply for jobs, they will appear here.</p>
                <Link to="/jobs" className="mt-6 inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    Find Jobs
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage; 