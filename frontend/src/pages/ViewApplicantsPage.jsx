import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApplications } from '../contexts/applicationContext';
import { useJobs } from '../contexts/jobContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ChevronDown, ChevronUp, Users, FileText, MessageSquare, BadgeCheck, Star, Mail, Phone, MapPin } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ViewApplicantsPage = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [showShortlisted, setShowShortlisted] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const { fetchJobApplicants } = useApplications();
  const { getSingleJob, shortlistApplicant } = useJobs();

  const loadData = async () => {
    const applicantsResult = await fetchJobApplicants(jobId);
    if (applicantsResult.success) setApplicants(applicantsResult.applicants);
    const jobResult = await getSingleJob(jobId);
    if (jobResult.success) setJob(jobResult.job);
  };

  useEffect(() => {
    if(jobId) loadData();
  }, [jobId]);

  const handleShortlist = async (applicationId, userId) => {
    const result = await shortlistApplicant(jobId, applicationId, userId);
    if(result.success){
      toast.success(result.message);
      loadData();
    } else {
      toast.error(result.message);
    }
  };
  
  const isShortlisted = (appId) => job?.shortlisted.some(s => s.applicationId === appId);
  const filteredApplicants = showShortlisted ? applicants.filter(app => isShortlisted(app._id)) : applicants;

  const chartData = {
    labels: applicants.map(app => app.name),
    datasets: [{
      label: 'ATS Score',
      data: applicants.map(app => app.atsScore),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderRadius: 4,
    }],
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Job Applicants</h1>
          <p className="text-gray-600 mt-1">For: {job?.title}</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-lg">
            <button onClick={() => setShowShortlisted(false)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!showShortlisted ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>
              All ({applicants.length})
            </button>
            <button onClick={() => setShowShortlisted(true)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${showShortlisted ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>
              Shortlisted ({job?.shortlisted.length || 0})
            </button>
        </div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="mb-10 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center"><Users className="mr-2" /> ATS Score Distribution</h2>
        <div style={{height: '300px'}}>
            <Bar data={chartData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }} />
        </div>
      </motion.div>

      <div className="space-y-4">
        {filteredApplicants.length > 0 ? filteredApplicants.map((app, i) => (
          <motion.div 
            key={app._id} 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={i}
            layout
            className={`bg-white p-6 rounded-xl shadow-md transition-all duration-300 ${isShortlisted(app._id) ? 'ring-2 ring-green-500' : 'hover:shadow-lg'}`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src={app.applicantID.user.profilePicture?.url || 'https://via.placeholder.com/150'} alt={app.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{app.name}</h2>
                        <div className="flex items-center gap-2 text-indigo-600 mt-1">
                            <BadgeCheck className="w-5 h-5" />
                            <span className="font-semibold">ATS Score: {app.atsScore}%</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <a href={app.resume.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                        <FileText className="w-4 h-4" /> Resume
                    </a>
                    <Link to={`/chat/${app._id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Chat
                    </Link>
                    <button onClick={() => handleShortlist(app._id, app.applicantID?.user?._id || app.applicantID?.user)} className={`flex items-center gap-2 px-3 py-2 text-sm text-white rounded-lg transition-colors ${isShortlisted(app._id) ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                        <Star className="w-4 h-4" /> {isShortlisted(app._id) ? 'Remove' : 'Shortlist'}
                    </button>
                    <button onClick={() => setExpandedId(expandedId === app._id ? null : app._id)} className="p-2 text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300">
                      {expandedId === app._id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                </div>
            </div>
            <AnimatePresence>
            {expandedId === app._id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Contact Information</h3>
                        <p className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /> {app.email}</p>
                        <p className="flex items-center gap-2 text-gray-600 mt-1"><Phone className="w-4 h-4" /> {app.phone}</p>
                        <p className="flex items-center gap-2 text-gray-600 mt-1"><MapPin className="w-4 h-4" /> {app.address}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Cover Letter</h3>
                      <p className="text-gray-600 bg-gray-100 p-3 rounded-md mt-1 whitespace-pre-wrap text-sm">{app.coverLetter}</p>
                    </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        )) : <p className="text-center text-gray-500 py-10">No applicants to display.</p>}
      </div>
    </div>
  );
};

export default ViewApplicantsPage; 