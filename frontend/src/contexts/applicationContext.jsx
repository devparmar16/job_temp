import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './authContext';

const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [myApplications, setMyApplications] = useState([]);
  const { isAuthenticated, user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1/application` : 'http://localhost:4000/api/v1/application';

  const applyForJob = async (formData) => {
    try {
      const { data } = await axios.post(`${API_URL}/post`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
      return { success: false };
    }
  };

  const fetchMyApplications = async () => {
    try {
        const { data } = await axios.get(`${API_URL}/getmyapplications`, { withCredentials: true });
        setMyApplications(data.applications);
        return { success: true, applications: data.applications };
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch applications');
        setMyApplications([]);
        return { success: false, applications: [] };
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Job Seeker') {
      fetchMyApplications();
    } else {
      setMyApplications([]);
    }
  }, [isAuthenticated, user]);

  const deleteApplication = async (id) => {
    try {
        const { data } = await axios.delete(`${API_URL}/delete/${id}`, { withCredentials: true });
        toast.success(data.message);
        return { success: true };
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete application');
        return { success: false };
    }
  };
  
  const fetchJobApplicants = async (jobId) => {
    try {
      const { data } = await axios.get(`${API_URL}/job/${jobId}`, { withCredentials: true });
      return { success: true, applicants: data.applications };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch applicants');
      return { success: false, applicants: [] };
    }
  }

  const checkAtsScore = async (formData) => {
    try {
      const { data } = await axios.post(`${API_URL}/check-ats`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(data.message);
      return { success: true, atsScore: data.atsScore };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check score');
      return { success: false };
    }
  };

  return (
    <ApplicationContext.Provider value={{ myApplications, applyForJob, fetchMyApplications, deleteApplication, fetchJobApplicants, checkAtsScore }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  return useContext(ApplicationContext);
}; 