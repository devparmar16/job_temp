import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import { useApplications } from '../contexts/applicationContext';
import { toast } from 'react-hot-toast';

const JobDetailsPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    coverLetter: '',
    phone: '',
    address: '',
    resume: null,
  });
  const [hasApplied, setHasApplied] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [resumeForCheck, setResumeForCheck] = useState(null);

  const { user } = useAuth();
  const { applyForJob, myApplications, checkAtsScore } = useApplications();

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:4000/api/v1/job/${id}`, { withCredentials: true });
        setJob(data.job);
        if(user){
            setApplicationData(prev => ({ ...prev, name: user.name, email: user.email }));
        }
      } catch (error) {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
        fetchJobDetails();
    }
    
    if (myApplications && myApplications.some(app => app.jobID?._id === id)) {
      setHasApplied(true);
    }

  }, [id, user, myApplications]);

  const handleCheckScore = async () => {
    if (!resumeForCheck) {
      toast.error("Please select a resume file first.");
      return;
    }
    const formData = new FormData();
    formData.append('resume', resumeForCheck);
    formData.append('jobId', id);
    const result = await checkAtsScore(formData);
    if (result.success) {
      setAtsScore(result.atsScore);
    }
  };

  const handleApply = () => {
    if(!user){
        // redirect to login
        return;
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resume') {
      setApplicationData({ ...applicationData, resume: files[0] });
    } else {
      setApplicationData({ ...applicationData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(applicationData).forEach(key => {
      formData.append(key, applicationData[key]);
    });
    formData.append('jobId', id);
    
    const result = await applyForJob(formData);
    if (result.success) {
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!job) {
    return <div>Job not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{job.title}</h1>
        <p className="text-gray-600 text-lg mt-1">{job.companyName}</p>
        <div className="mt-6">
            { user && user.role === 'Job Seeker' && !hasApplied && (
                <button 
                    className="px-6 py-3 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors" 
                    onClick={handleApply}
                    disabled={hasApplied}
                >
                    Apply Now
                </button>
            )}
             { user && user.role === 'Job Seeker' && hasApplied && (
                <p className="text-lg font-medium text-green-600">You have already applied for this job.</p>
            )}
        </div>
      </div>

      {user?.role === 'Job Seeker' && !hasApplied && (
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your ATS Score</h2>
            <p className="text-gray-600 mb-4">Upload your resume to see how well you match this job's requirements before you apply.</p>
            <div className="flex items-center gap-4">
                <input 
                    type="file" 
                    onChange={(e) => setResumeForCheck(e.target.files[0])} 
                    className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    accept=".pdf"
                />
                <button onClick={handleCheckScore} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    Check Score
                </button>
            </div>
            {atsScore !== null && (
                <div className="mt-6 text-center">
                    <p className="text-xl font-medium text-gray-700">Your Estimated ATS Score:</p>
                    <p className="text-5xl font-bold text-indigo-600 mt-2">{atsScore}%</p>
                </div>
            )}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Salary:</strong> {job.fixedSalary ? `$${job.fixedSalary}` : `$${job.salaryFrom} - $${job.salaryTo}`}</p>
                <p><strong>Category:</strong> {job.category}</p>
                <p><strong>Job Type:</strong> {job.jobType}</p>
                <p><strong>Skills:</strong> {job.skills.join(', ')}</p>
            </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Apply for {job.title}</h3>
            <form onSubmit={handleSubmit} className="mt-2 space-y-4">
              <input type="text" name="name" value={applicationData.name} onChange={handleChange} placeholder="Name" className="w-full px-3 py-2 mt-1 border rounded-md" required />
              <input type="email" name="email" value={applicationData.email} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 mt-1 border rounded-md" required />
              <input type="text" name="phone" value={applicationData.phone} onChange={handleChange} placeholder="Phone" className="w-full px-3 py-2 mt-1 border rounded-md" required />
              <input type="text" name="address" value={applicationData.address} onChange={handleChange} placeholder="Address" className="w-full px-3 py-2 mt-1 border rounded-md" required />
              <textarea name="coverLetter" value={applicationData.coverLetter} onChange={handleChange} placeholder="Cover Letter" className="w-full px-3 py-2 mt-1 border rounded-md" required />
              <div>
                <label className="block text-sm font-medium">Resume (PDF only)</label>
                <input type="file" name="resume" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" accept=".pdf" required />
              </div>
              <div className="items-center px-4 py-3">
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700">
                  Submit Application
                </button>
                <button onClick={() => setIsModalOpen(false)} className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage; 