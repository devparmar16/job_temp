import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Trash2, User, Briefcase, Mail, Phone, GraduationCap, Code, Globe, Plus, X, Download, Building } from 'lucide-react';

// --- Reusable Array Input Manager ---
const ArrayInputManager = ({ label, items, onAdd, onRemove, placeholder, icon }) => {
    const [inputValue, setInputValue] = useState('');
    const Icon = icon;

    const handleAdd = () => {
        if (inputValue.trim() === '') return;
        onAdd(inputValue.trim());
        setInputValue('');
    };

    return (
        <div>
            <label className="text-sm font-bold text-gray-700">{label}</label>
            <div className="flex flex-wrap gap-2 mt-2">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full"
                    >
                        {item}
                        <button onClick={() => onRemove(index)} className="ml-2 text-blue-500 hover:text-blue-900">
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </div>
            <div className="relative mt-3">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={placeholder}
                />
                <button type="button" onClick={handleAdd} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};

// --- Job Seeker Profile Component ---
const JobSeekerProfile = ({ user, formData, setFormData, handleAddItem, handleRemoveItem }) => {
    const [activeTab, setActiveTab] = useState('personal');
    const tabs = ['personal', 'skills', 'education'];
    
    return (
        <div className="space-y-8">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'personal' && (
                        <div className="space-y-6">
                           <div><label className="font-semibold text-gray-700">Name</label><input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
                           <div><label className="font-semibold text-gray-700">Phone</label><input type="text" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
                        </div>
                    )}
                    {activeTab === 'skills' && (
                        <div className="space-y-6">
                            <ArrayInputManager label="Skills" items={formData.skills} onAdd={(item) => handleAddItem('skills', item)} onRemove={(index) => handleRemoveItem('skills', index)} placeholder="Add a new skill..." icon={Code} />
                            <ArrayInputManager label="Languages" items={formData.languages} onAdd={(item) => handleAddItem('languages', item)} onRemove={(index) => handleRemoveItem('languages', index)} placeholder="Add a new language..." icon={Globe} />
                        </div>
                    )}
                    {activeTab === 'education' && (
                        <div className="space-y-6">
                           <ArrayInputManager label="Education" items={formData.education} onAdd={(item) => handleAddItem('education', item)} onRemove={(index) => handleRemoveItem('education', index)} placeholder="Add education credential..." icon={GraduationCap} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
};


// --- Employer Profile Component ---
const EmployerProfile = ({ user, formData, setFormData }) => (
    <div className="space-y-6">
        <div><label className="font-semibold text-gray-700">Name</label><input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
        <div><label className="font-semibold text-gray-700">Phone</label><input type="text" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
        <div className="pt-4 border-t">
            <h3 className="text-lg font-bold text-gray-800">Company Details</h3>
        </div>
        <div><label className="font-semibold text-gray-700">Company Name</label><input type="text" name="companyName" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
        <div><label className="font-semibold text-gray-700">Company Description</label><textarea name="companyDescription" value={formData.companyDescription} onChange={(e) => setFormData({...formData, companyDescription: e.target.value})} rows="4" className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500" /></div>
    </div>
);


// --- Main Profile Page Component ---
const ProfilePage = () => {
  const { user, updateProfile, updateProfilePicture, removeProfilePicture } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', companyName: '', companyDescription: '',
    education: [], skills: [], languages: [],
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
        companyDescription: user.companyDescription || '',
        education: user.education || [],
        skills: user.skills || [],
        languages: user.languages || [],
      });
      setProfilePicPreview(user.profilePicture?.url || '');
    }
  }, [user]);
  
  const handlePicChange = (e) => {
      const file = e.target.files[0];
      if(file) {
        setProfilePicFile(file);
        setProfilePicPreview(URL.createObjectURL(file));
      }
  }

  const handlePicUpdate = async () => {
      if(!profilePicFile) return toast.error("Please select an image first.");
      const formData = new FormData();
      formData.append('profilePicture', profilePicFile);
      await updateProfilePicture(formData);
      setProfilePicFile(null);
  }

  const handlePicRemove = async () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
        await removeProfilePicture();
    }
  }

  const handleAddItem = useCallback((field, item) => setFormData(prev => ({ ...prev, [field]: [...prev[field], item] })), []);
  const handleRemoveItem = useCallback((field, index) => setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) })), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  if (!user) return <div className="text-center p-10">Loading profile...</div>;

  const ProfileIcon = user.role === 'Employer' ? Building : User;

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
            >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* --- Left Column: Profile Picture --- */}
                    <div className="w-full md:w-1/3 text-center">
                        <div className="relative w-48 h-48 mx-auto group">
                            <img src={profilePicPreview || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full rounded-full object-cover ring-4 ring-white shadow-lg" />
                            <label htmlFor="profilePicInput" className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
                                <Camera className="text-white text-4xl" />
                            </label>
                            <input type="file" id="profilePicInput" onChange={handlePicChange} className="hidden" accept="image/*" />
                        </div>
                        <div className="mt-4 space-y-2">
                           {profilePicFile && <button onClick={handlePicUpdate} className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Picture</button>}
                           {user.profilePicture?.fileName && <button onClick={handlePicRemove} className="w-full px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"><Trash2 size={16}/> Remove</button>}
                        </div>
                    </div>

                    {/* --- Right Column: User Details --- */}
                    <div className="w-full md:w-2/3">
                        <div className="flex items-center gap-4">
                            <ProfileIcon className="w-12 h-12 text-blue-600"/>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{formData.name}</h1>
                                <p className="text-gray-500 flex items-center gap-2 mt-1"><Mail size={14} /> {formData.email}</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                            {user.role === 'Job Seeker' ? (
                                <JobSeekerProfile user={user} formData={formData} setFormData={setFormData} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />
                            ) : (
                                <EmployerProfile user={user} formData={formData} setFormData={setFormData} />
                            )}
                            <div className="pt-6 border-t">
                                <button type="submit" className="w-full px-6 py-3 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Update Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    </div>
  );
};

export default ProfilePage; 