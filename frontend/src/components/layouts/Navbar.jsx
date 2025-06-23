import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, FileText, User, LogIn, UserPlus, LogOut, X, Menu, Building, PlusSquare } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfileMenu = () => setProfileOpen(!profileOpen);

  const baseLinkClasses = "flex items-center px-3 py-2 rounded-md text-sm font-medium";
  const activeLinkClasses = "bg-gray-900 text-white";
  const inactiveLinkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  const mobileLinkClasses = "block px-3 py-2 rounded-md text-base font-medium";
  const activeMobileLinkClasses = "bg-gray-900 text-white";
  const inactiveMobileLinkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  const menuVariants = {
    closed: { opacity: 0, scale: 0.95, y: -10 },
    open: { opacity: 1, scale: 1, y: 0 },
  };

  const commonLinks = (mobile = false) => (
    <>
        <NavLink to="/jobs" className={({ isActive }) => `${mobile ? mobileLinkClasses : baseLinkClasses} ${isActive ? (mobile ? activeMobileLinkClasses : activeLinkClasses) : (mobile ? inactiveMobileLinkClasses : inactiveLinkClasses)}`}>
            <Briefcase className="mr-2 h-5 w-5" /> Find Jobs
        </NavLink>
    </>
  );

  const jobSeekerLinks = (mobile = false) => (
    <>
      <NavLink to="/" end className={({ isActive }) => `${mobile ? mobileLinkClasses : baseLinkClasses} ${isActive ? (mobile ? activeMobileLinkClasses : activeLinkClasses) : (mobile ? inactiveMobileLinkClasses : inactiveLinkClasses)}`}>
        <Home className="mr-2 h-5 w-5" /> Dashboard
      </NavLink>
      <NavLink to="/my-applications" className={({ isActive }) => `${mobile ? mobileLinkClasses : baseLinkClasses} ${isActive ? (mobile ? activeMobileLinkClasses : activeLinkClasses) : (mobile ? inactiveMobileLinkClasses : inactiveLinkClasses)}`}>
        <FileText className="mr-2 h-5 w-5" /> My Applications
      </NavLink>
    </>
  );
  
  const employerLinks = (mobile = false) => (
      <>
        <NavLink to="/" end className={({ isActive }) => `${mobile ? mobileLinkClasses : baseLinkClasses} ${isActive ? (mobile ? activeMobileLinkClasses : activeLinkClasses) : (mobile ? inactiveMobileLinkClasses : inactiveLinkClasses)}`}>
          <Home className="mr-2 h-5 w-5" /> Dashboard
        </NavLink>
        <NavLink to="/post-job" className={({ isActive }) => `${mobile ? mobileLinkClasses : baseLinkClasses} ${isActive ? (mobile ? activeMobileLinkClasses : activeLinkClasses) : (mobile ? inactiveMobileLinkClasses : inactiveLinkClasses)}`}>
          <PlusSquare className="mr-2 h-5 w-5" /> Post Job
        </NavLink>
        <NavLink to="/my-jobs" className={({ isActive }) => `${mobile ? mobileLinkClasses : baseLinkClasses} ${isActive ? (mobile ? activeMobileLinkClasses : activeLinkClasses) : (mobile ? inactiveMobileLinkClasses : inactiveLinkClasses)}`}>
          <Building className="mr-2 h-5 w-5" /> My Jobs
        </NavLink>
      </>
  );

  const guestLinks = (mobile = false) => (
    <>
      <NavLink to="/login" className={({ isActive }) => `${mobile ? mobileLinkClasses : baseLinkClasses} ${isActive ? (mobile ? activeMobileLinkClasses : activeLinkClasses) : (mobile ? inactiveMobileLinkClasses : inactiveLinkClasses)}`}>
        <LogIn className="mr-2 h-5 w-5" /> Login
      </NavLink>
      <NavLink to="/register" className={({ isActive }) => `${mobile ? mobileLinkClasses : baseLinkClasses} ${isActive ? (mobile ? activeMobileLinkClasses : activeLinkClasses) : (mobile ? inactiveMobileLinkClasses : inactiveLinkClasses)}`}>
        <UserPlus className="mr-2 h-5 w-5" /> Register
      </NavLink>
    </>
  );

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl flex items-center">
              <Briefcase className="mr-2" /> JobConnect
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {loading ? null : (isAuthenticated && user) ? (user.role === 'Job Seeker' ? jobSeekerLinks() : employerLinks()) : null}
                {commonLinks()}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            {(isAuthenticated && user) ? (
              <div className="ml-4 flex items-center md:ml-6">
                <div className="ml-3 relative">
                  <div>
                    <button onClick={toggleProfileMenu} className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Open user menu</span>
                      <img className="h-9 w-9 rounded-full object-cover" src={user?.profilePicture?.url || 'https://via.placeholder.com/40'} alt="profile" />
                    </button>
                  </div>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        variants={menuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                      >
                        <NavLink to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                          <User className="mr-2 h-4 w-4" /> Your Profile
                        </NavLink>
                        <button onClick={() => { logout(); setProfileOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center">
                          <LogOut className="mr-2 h-4 w-4" /> Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">{loading ? null : guestLinks()}</div>
            )}
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={toggleMenu} className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {loading ? null : (isAuthenticated && user) ? (user.role === 'Job Seeker' ? jobSeekerLinks(true) : employerLinks(true)) : guestLinks(true)}
              {(isAuthenticated && user) && (
                <div className="pt-4 pb-3 border-t border-gray-700">
                    <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                            <img className="h-10 w-10 rounded-full object-cover" src={user?.profilePicture?.url || 'https://via.placeholder.com/40'} alt="profile" />
                        </div>
                        <div className="ml-3">
                            <div className="text-base font-medium leading-none text-white">{user.name}</div>
                            <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                        </div>
                    </div>
                    <div className="mt-3 px-2 space-y-1">
                        <NavLink to="/profile" className={mobileLinkClasses + " " + inactiveMobileLinkClasses}>
                            <User className="mr-2 h-5 w-5" /> Your Profile
                        </NavLink>
                        <button onClick={() => { logout(); setIsOpen(false); }} className={`${mobileLinkClasses} ${inactiveMobileLinkClasses} w-full text-left`}>
                            <LogOut className="mr-2 h-5 w-5" /> Sign out
                        </button>
                    </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 