import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './authContext';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1/job` : 'http://localhost:4000/api/v1/job';

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/getall`, { withCredentials: true });
      setJobs(data.jobs);
    } catch (error) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/getmyjobs`, { withCredentials: true });
      return { success: true, jobs: data.myJobs };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch jobs' };
    } finally {
        setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchJobs();
  }, []);

  const postJob = async (jobData) => {
    try {
      const { data } = await axios.post(`${API_URL}/post`, jobData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      fetchJobs();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to post job' };
    }
  };

  const updateJob = async (id, jobData) => {
    try {
      const { data } = await axios.put(`${API_URL}/update/${id}`, jobData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update job' };
    }
  };

  const deleteJob = async (id) => {
    try {
      const { data } = await axios.delete(`${API_URL}/delete/${id}`, { withCredentials: true });
      fetchJobs();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete job' };
    }
  };
  
  const getSingleJob = async (id) => {
    try {
        const { data } = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
        return { success: true, job: data.job };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to fetch job' };
    }
  };

  const shortlistApplicant = async (jobId, applicationId, userId) => {
    try {
      const { data } = await axios.post(`${API_URL}/shortlist`, { jobId, applicationId, userId }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to shortlist applicant' };
    }
  };

  return (
    <JobContext.Provider value={{ jobs, loading, fetchJobs, postJob, fetchMyJobs, updateJob, deleteJob, getSingleJob, shortlistApplicant }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  return useContext(JobContext);
}; 