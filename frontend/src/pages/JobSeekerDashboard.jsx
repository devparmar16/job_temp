import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useApplications } from '../contexts/applicationContext';
import { useJobs } from '../contexts/jobContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Briefcase, BarChart2, MessageSquare, User, CheckCircle, Award } from 'lucide-react';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const { myApplications } = useApplications();
  const { jobs } = useJobs();

  const [highestAts, setHighestAts] = useState({ score: 0, jobTitle: '' });
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [profileStatus, setProfileStatus] = useState(0);

  useEffect(() => {
    if (myApplications.length > 0) {
      const highest = myApplications.reduce((prev, current) => (prev.atsScore > current.atsScore) ? prev : current);
      setHighestAts({ score: highest.atsScore, jobTitle: highest.jobID.title });
    }

    if (user && jobs.length > 0) {
      const userSkills = user.skills.map(skill => skill.toLowerCase());
      const recJobs = jobs.filter(job =>
        job.skills.some(skill => userSkills.includes(skill.toLowerCase()))
      ).slice(0, 5);
      setRecommendedJobs(recJobs);
    }
    
    if (user) {
      let completed = 0;
      if (user.name) completed++;
      if (user.email) completed++;
      if (user.phone) completed++;
      if (user.skills && user.skills.length > 0) completed++;
      if (user.resume && user.resume.url) completed++;
      setProfileStatus((completed / 5) * 100);
    }

  }, [myApplications, user, jobs]);

  const profileData = [
    { name: 'Profile', completed: profileStatus, remaining: 100 - profileStatus }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's your job search at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Applications */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <Briefcase className="w-12 h-12 text-blue-500" />
          <div>
            <p className="text-gray-600">Total Applications</p>
            <p className="text-3xl font-bold">{myApplications.length}</p>
          </div>
        </div>

        {/* Highest ATS Score */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <Award className="w-12 h-12 text-green-500" />
            <div>
                <p className="text-gray-600">Highest ATS Score</p>
                <p className="text-3xl font-bold">{highestAts.score}%</p>
                <p className="text-sm text-gray-500 truncate">for {highestAts.jobTitle}</p>
            </div>
        </div>
        
        {/* Messages */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <MessageSquare className="w-12 h-12 text-purple-500" />
            <div>
                <p className="text-gray-600">Messages</p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-gray-500">No new messages</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 flex items-center"><Briefcase className="mr-2"/> Recommended Jobs</h2>
          <div className="space-y-4">
            {recommendedJobs.length > 0 ? recommendedJobs.map(job => (
              <div key={job._id} className="p-4 border rounded-lg hover:bg-gray-50">
                <h3 className="font-bold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.companyName}</p>
              </div>
            )) : <p>No recommendations for now. Update your skills for better matches.</p>}
          </div>
        </div>

        <div className="space-y-6">
            {/* Profile Status */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center"><User className="mr-2"/> Profile Status</h2>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={profileData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#3b82f6" name="Completed" />
                  <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center font-bold">{Math.round(profileStatus)}% Complete</p>
            </div>
            
            {/* Skills */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center"><CheckCircle className="mr-2"/> Your Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {user?.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>

    </motion.div>
  );
};

export default JobSeekerDashboard; 