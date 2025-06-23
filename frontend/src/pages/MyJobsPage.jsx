import React, { useEffect, useState } from 'react';
import { useJobs } from '../contexts/jobContext';
import { useAuth } from '../contexts/authContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApplications } from '../contexts/applicationContext';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Users, Trash2, Edit, Eye, Calendar, MapPin, Badge } from 'lucide-react';

const MyJobsPage = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { fetchMyJobs, deleteJob } = useJobs();
  const { fetchJobApplicants } = useApplications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadMyJobs = async () => {
    setLoading(true);
    const result = await fetchMyJobs();
    if (result.success) {
      const jobsWithCounts = await Promise.all(
        result.jobs.map(async (job) => {
          const applicantsResult = await fetchJobApplicants(job._id);
          return {
            ...job,
            applicantCount: applicantsResult.success ? applicantsResult.applicants.length : 0,
          };
        })
      );
      setMyJobs(jobsWithCounts);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role !== 'Employer') {
      navigate('/');
    } else {
      loadMyJobs();
    }
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      const result = await deleteJob(id);
      if (result.success) {
        toast.success(result.message);
        loadMyJobs();
      } else {
        toast.error(result.message);
      }
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

  if (loading) {
    return <div className="text-center p-10">Loading your jobs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">My Jobs</h1>
            <Link to="/post-job" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                <Plus size={20} /> Post New Job
            </Link>
        </div>
        
        {myJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myJobs.map((job, i) => (
                <motion.div 
                    key={job._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between"
                >
                    <div>
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold text-gray-800 flex-grow pr-4">{job.title}</h2>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${job.expired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {job.expired ? 'Expired' : 'Active'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-2 space-y-1">
                            <p className="flex items-center gap-2"><MapPin size={14} /> {job.city}, {job.country}</p>
                            <p className="flex items-center gap-2"><Calendar size={14} /> Posted: {new Date(job.jobPostedOn).toLocaleDateString()}</p>
                            <p className="flex items-center gap-2"><Users size={14} /> {job.applicantCount} Applicants</p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-2 border-t pt-4">
                        <button onClick={() => navigate(`/job/applicants/${job._id}`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors" title="View Applicants">
                            <Eye size={20} />
                        </button>
                        <button onClick={() => navigate(`/post-job/${job._id}`)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors" title="Edit Job">
                            <Edit size={20} />
                        </button>
                        <button onClick={() => handleDelete(job._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors" title="Delete Job">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </motion.div>
                ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <Briefcase className="mx-auto w-16 h-16 text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-800">No Jobs Posted Yet</h3>
                <p className="mt-2 text-gray-500">Click the button below to post your first job and find the best talent.</p>
                <Link to="/post-job" className="mt-6 inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    Post a Job
                </Link>
            </div>
        )}
    </div>
  );
};

export default MyJobsPage; 