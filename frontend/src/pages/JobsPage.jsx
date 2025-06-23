import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Assuming useJobs context is defined and accessible at this path
// This import path assumes a 'contexts' folder exists one level up from the component.
// If your context file is structured differently, please adjust this path.
import { useJobs } from '../contexts/jobContext';

const JobsPage = () => {
  // Destructuring jobs and loading state from the job context
  const { jobs, loading } = useJobs();

  // State to hold jobs after filtering
  const [filteredJobs, setFilteredJobs] = useState([]);

  // State to manage the filter input values
  const [filters, setFilters] = useState({
    title: '',
    country: '',
    city: '',
    jobType: 'All',
  });

  // useEffect hook to apply filters whenever 'jobs' data or 'filters' change
  useEffect(() => {
    let result = jobs; // Start with all jobs

    // Apply title filter if 'title' input is not empty
    if (filters.title) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }
    // Apply country filter if 'country' input is not empty
    if (filters.country) {
      result = result.filter(job =>
        job.country.toLowerCase().includes(filters.country.toLowerCase())
      );
    }
    // Apply city filter if 'city' input is not empty
    if (filters.city) {
      result = result.filter(job =>
        job.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    if (filters.jobType && filters.jobType !== 'All') {
      result = result.filter(job => job.jobType === filters.jobType);
    }
    setFilteredJobs(result); // Update the filtered jobs state
  }, [jobs, filters]); // Dependencies: re-run when 'jobs' or 'filters' change

  // Handler for changes in filter input fields
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Display a loading message while job data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-700 animate-pulse">Loading job listings...</div>
      </div>
    );
  }

  return (
    // Main container for the job page, with responsive padding and background
    <div className="min-h-screen bg-gray-50 font-sans py-10 sm:py-12 md:py-16">
      {/* Centered content area with a maximum width for desktop */}
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Page Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-8 sm:mb-12 text-center leading-tight">
          Discover Your Next Opportunity
        </h1>

        {/* Filter Section */}
        <div className="mb-12 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Input for searching by job title */}
            <input
              type="text"
              name="title"
              placeholder="Search by title..."
              value={filters.title}
              onChange={handleFilterChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-500"
              aria-label="Search by job title"
            />
            {/* Input for filtering by country */}
            <input
              type="text"
              name="country"
              placeholder="Filter by country..."
              value={filters.country}
              onChange={handleFilterChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-500"
              aria-label="Filter by country"
            />
            {/* Input for filtering by city */}
            <input
              type="text"
              name="city"
              placeholder="Filter by city..."
              value={filters.city}
              onChange={handleFilterChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-500"
              aria-label="Filter by city"
            />
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              aria-label="Filter by job type"
            >
              <option value="All">All Types</option>
              <option value="Full Time">Full-time</option>
              <option value="Part Time">Part-time</option>
              <option value="Remote">Remote</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {filteredJobs && filteredJobs.length > 0 ? (
            // Map through filtered jobs and render a job card for each
            filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200
                           hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out
                           flex flex-col justify-between" // Ensures cards have consistent height
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    {/* Job Title */}
                    <h2 className="text-2xl font-extrabold text-gray-900 leading-tight pr-4">
                      {job.title}
                    </h2>
                    {/* Job Type Tag with dynamic styling */}
                    <span
                      className={`text-sm font-bold px-4 py-1.5 rounded-full whitespace-nowrap 
                                  ${job.jobType === 'Full Time' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}
                    >
                      {job.jobType}
                    </span>
                  </div>
                  {/* Company Name */}
                  <p className="text-lg text-gray-700 font-semibold mb-1">
                    {job.companyName}
                  </p>
                  {/* Location */}
                  <p className="text-md text-gray-500 flex items-center">
                    {/* Consider adding a location icon here using Lucide React or similar if desired */}
                    {job.city}, {job.country}
                  </p>
                  {/* Job Description (clamped to 4 lines for consistent card height) */}
                  <p className="text-gray-700 my-4 leading-relaxed line-clamp-4">
                    {job.description}
                  </p>
                </div>
                {/* Salary and View Details Button */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                  {/* Salary Display */}
                  <span className="text-2xl font-extrabold text-indigo-700">
                    {job.fixedSalary
                      ? `$${job.fixedSalary.toLocaleString()}`
                      : `$${job.salaryFrom.toLocaleString()} - $${job.salaryTo.toLocaleString()}`}
                  </span>
                  {/* View Details Button */}
                  <Link
                    to={`/job/${job._id}`}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold
                               hover:bg-indigo-700 transition-colors duration-300
                               shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            // Message displayed when no jobs match the filters
            <p className="col-span-full text-center text-gray-600 text-xl py-10 rounded-lg bg-white shadow-sm border border-gray-100">
              No jobs match your criteria. Please adjust your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
