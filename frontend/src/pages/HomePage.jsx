import React from 'react';
import { useAuth } from '../contexts/authContext';
import JobSeekerDashboard from './JobSeekerDashboard';
import EmployerDashboard from './EmployerDashboard';
import { useJobs } from '../contexts/jobContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Building, DollarSign, Search, ArrowRight, UserCheck, FilePlus, Zap } from 'lucide-react';

const PublicHomePage = () => {
    const { jobs, loading } = useJobs();
    const featuredJobs = jobs.slice(0, 6);

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
            >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                    Find Your <span className="text-blue-600">Dream Job</span> Today
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    Connect with top employers and discover opportunities that match your skills and passion.
                </p>
                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    <Link to="/jobs" className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        <Search size={20} /> Find a Job
                    </Link>
                    <Link to="/register" className="flex items-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors">
                        Post a Job <ArrowRight size={20} />
                    </Link>
                </div>
            </motion.div>

            {/* How It Works Section */}
            <div className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
                    <p className="mt-2 text-gray-600">A simple process for candidates and employers.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    <div className="text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                           <UserCheck size={32} />
                        </div>
                        <h3 className="text-xl font-semibold">Create an Account</h3>
                        <p className="mt-2 text-gray-500">Sign up and build your professional profile in minutes.</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                           <FilePlus size={32} />
                        </div>
                        <h3 className="text-xl font-semibold">Find or Post Jobs</h3>
                        <p className="mt-2 text-gray-500">Search for jobs that fit your skills or post openings to find talent.</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                           <Zap size={32} />
                        </div>
                        <h3 className="text-xl font-semibold">Apply or Connect</h3>
                        <p className="mt-2 text-gray-500">Apply for jobs with a single click or connect with qualified candidates.</p>
                    </div>
                </div>
            </div>

            {/* Featured Jobs Section */}
            <div className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Latest Job Openings</h2>
                    <p className="mt-2 text-gray-600">Here are some of the most recent opportunities.</p>
                </div>
                {loading ? <p className="text-center">Loading jobs...</p> :
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {featuredJobs.map(job => (
                        <motion.div 
                            key={job._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ease-in-out"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <Building className="w-8 h-8 text-gray-600"/>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{job.companyName}</p>
                                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                                        <MapPin size={14}/> {job.city}, {job.country}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{job.jobType}</span>
                                <Link to={`/job/${job._id}`} className="text-sm font-semibold text-blue-600 hover:underline">View Details</Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
                }
                <div className="text-center mt-12">
                    <Link to="/jobs" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        View All Jobs
                    </Link>
                </div>
            </div>
        </div>
    );
}


const HomePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (user && user.role === 'Job Seeker') {
    return <JobSeekerDashboard />;
  }

  if (user && user.role === 'Employer') {
    return <EmployerDashboard />;
  }

  return <PublicHomePage />;
};

export default HomePage; 