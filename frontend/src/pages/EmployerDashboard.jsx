import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useJobs } from '../contexts/jobContext';
import { useApplications } from '../contexts/applicationContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Users, Trash2, Edit, Eye, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { fetchMyJobs, deleteJob } = useJobs();
  const { fetchJobApplicants } = useApplications();
  const navigate = useNavigate();

  const [myJobs, setMyJobs] = useState([]);
  const [allApplicants, setAllApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const jobsResult = await fetchMyJobs();
    if (jobsResult.success) {
      setMyJobs(jobsResult.jobs);
      let applicantsData = [];
      for (const job of jobsResult.jobs) {
        const applicantsResult = await fetchJobApplicants(job._id);
        if (applicantsResult.success) {
            const applicantsWithJobTitle = applicantsResult.applicants.map(app => ({...app, jobTitle: job.title}));
            applicantsData = [...applicantsData, ...applicantsWithJobTitle];
        }
      }
      setAllApplicants(applicantsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job post?')) {
      const result = await deleteJob(id);
      if (result.success) {
        fetchData();
      }
    }
  };

  const totalApplications = allApplicants.length;
  const recentApplicants = allApplicants.slice(0, 5);
  
  const applicationByJobData = myJobs.map(job => ({
      name: job.title,
      value: allApplicants.filter(app => app.jobID === job._id).length
  })).filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Hello, {user?.name} 👋</h1>
            <p className="text-gray-600 mt-2">Here's an overview of your hiring activities.</p>
        </div>
        <Link to="/post-job" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <Plus /> Post a New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <Briefcase className="w-12 h-12 text-blue-500" />
          <div>
            <p className="text-gray-600">Total Jobs Posted</p>
            <p className="text-3xl font-bold">{myJobs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <Users className="w-12 h-12 text-green-500" />
          <div>
            <p className="text-gray-600">Total Applications</p>
            <p className="text-3xl font-bold">{totalApplications}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <BarChart2 className="w-12 h-12 text-purple-500" />
            <div>
                <p className="text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold">{myJobs.length > 0 ? `${((totalApplications / myJobs.length) * 10).toFixed(1)}%` : 'N/A'}</p>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Active Job Posts</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {myJobs.map(job => (
              <div key={job._id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                <div>
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <p className="text-sm text-gray-500">Posted on: {new Date(job.jobPostedOn).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/job/applicants/${job._id}`)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Eye /></button>
                    <button onClick={() => navigate(`/post-job/${job._id}`)} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><Edit /></button>
                    <button onClick={() => handleDelete(job._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
          <div className="space-y-3">
            {recentApplicants.map(app => (
              <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{app.name}</p>
                  <p className="text-sm text-gray-500">Applied for: {app.jobTitle}</p>
                </div>
                <Link to={`/job/applicants/${app.jobID}`} className="text-sm text-blue-600 hover:underline">View</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Applications by Job</h2>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie data={applicationByJobData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {applicationByJobData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
      </div>

    </motion.div>
  );
};

export default EmployerDashboard; 