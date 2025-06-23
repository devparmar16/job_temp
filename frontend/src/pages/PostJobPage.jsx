import React, { useState, useEffect } from 'react';
import { useJobs } from '../contexts/jobContext';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/authContext';

const PostJobPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    category: '',
    country: '',
    city: '',
    location: '',
    skills: '',
    jobType: 'Full Time',
    salaryType: 'range',
    fixedSalary: '',
    salaryFrom: '',
    salaryTo: '',
  });
  const { postJob, getSingleJob, updateJob } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchJobData = async () => {
        const result = await getSingleJob(id);
        if (result.success) {
          const { job } = result;
          setFormData({
            ...job,
            skills: job.skills.join(', '),
            salaryType: job.fixedSalary ? 'fixed' : 'range',
          });
        }
      };
      fetchJobData();
    }
  }, [id, getSingleJob]);

  if (user?.role !== 'Employer') {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skillsArray = formData.skills.split(',').map(skill => skill.trim());
    const jobData = { ...formData, skills: skillsArray };
    
    let result;
    if(id){
        result = await updateJob(id, jobData);
    } else {
        result = await postJob(jobData);
    }

    if (result.success) {
      toast.success(result.message);
      navigate('/my-jobs');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                {id ? 'Edit Job' : 'Post a New Job'}
            </h1>
            <p className="mt-3 text-lg text-gray-600">
                Fill out the form below to publish a job posting on our platform.
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="5" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Skills (comma-separated)</label>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
            </div>

            <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Job Type</label>
                    <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Remote">Remote</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Salary Type</label>
                    <select name="salaryType" value={formData.salaryType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="range">Range</option>
                        <option value="fixed">Fixed</option>
                    </select>
                </div>
            </div>

            {formData.salaryType === 'fixed' ? (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fixed Salary</label>
                    <input type="number" name="fixedSalary" value={formData.fixedSalary} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Salary From</label>
                        <input type="number" name="salaryFrom" value={formData.salaryFrom} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Salary To</label>
                        <input type="number" name="salaryTo" value={formData.salaryTo} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>
            )}
            
            <div className="pt-6">
                <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-md transition-colors">
                    {id ? 'Update Job' : 'Post Job'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage; 