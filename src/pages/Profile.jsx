import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import EditableSection from '../components/EditableSection';
import { HiAcademicCap, HiPencil, HiSave, HiX, HiPlus, HiTrash } from 'react-icons/hi';
import { HiBeaker, HiBookOpen, HiChip, HiClock, HiDocumentText, HiGlobe, HiLightBulb, HiLocationMarker, HiMail, HiUserGroup } from 'react-icons/hi';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@research.edu',
    university: 'Stanford University',
    department: 'Computer Science',
    bio: 'PhD candidate focusing on AI and Machine Learning, with a particular interest in developing novel deep learning architectures for computer vision applications.',
    researchInterests: [
      'Machine Learning',
      'Artificial Intelligence',
      'Computer Vision',
      'Natural Language Processing'
    ],
    preferredLocations: [
      'United States',
      'United Kingdom',
      'Germany',
      'Canada'
    ],
    skills: [
      'Python',
      'TensorFlow',
      'PyTorch',
      'Computer Vision',
      'Deep Learning'
    ],
    publications: [
      {
        title: 'Deep Learning Approaches in Medical Image Analysis',
        journal: 'IEEE Transactions on Medical Imaging',
        year: 2023,
        citations: 45,
        link: 'https://example.com/paper1'
      },
      {
        title: 'Transformer-based Architecture for Medical Report Generation',
        journal: 'Nature Machine Intelligence',
        year: 2023,
        citations: 32,
        link: 'https://example.com/paper2'
      }
    ],
    projects: [
      {
        title: 'AI-Powered Medical Diagnosis',
        description: 'Developed a deep learning system for automated medical image analysis',
        technologies: ['Python', 'PyTorch', 'Docker'],
        link: 'https://github.com/alexj/medical-ai'
      },
      {
        title: 'Natural Language Processing Framework',
        description: 'Created a framework for processing and analyzing medical reports',
        technologies: ['Python', 'BERT', 'Transformers'],
        link: 'https://github.com/alexj/nlp-framework'
      }
    ],
    achievements: [
      {
        title: 'Best Paper Award',
        description: 'ICML 2023 - Deep Learning Track',
        year: 2023
      },
      {
        title: 'Research Grant',
        description: 'AI for Healthcare Initiative - $50,000',
        year: 2023
      }
    ],
    collaborations: [
      {
        name: 'Dr. Sarah Chen',
        institution: 'MIT',
        project: 'AI in Healthcare',
        status: 'Ongoing'
      },
      {
        name: 'Prof. Michael Brown',
        institution: 'Oxford University',
        project: 'Computer Vision Research',
        status: 'Completed'
      }
    ],
    availability: {
      status: 'Open to Collaboration',
      interests: ['Research Projects', 'Paper Reviews', 'Conference Organization'],
      preferredTimeZone: 'PST (UTC-8)'
    }
  });

  const [profileData, setProfileData] = useState({
    overview: `<p>${profile.bio}</p>`,
    publications: `<ul>
      ${profile.publications.map((pub, index) => (
        `<li key=${index}>${pub.title} - ${pub.journal} • ${pub.year}</li>`
      )).join('')}
    </ul>`,
    projects: `<ul>
      ${profile.projects.map((project, index) => (
        `<li key=${index}><strong>${project.title}</strong> - ${project.description}</li>`
      )).join('')}
    </ul>`,
    achievements: `<ul>
      ${profile.achievements.map((achievement, index) => (
        `<li key=${index}>${achievement.title} - ${achievement.description} • ${achievement.year}</li>`
      )).join('')}
    </ul>`,
    collaborations: `<ul>
      ${profile.collaborations.map((collab, index) => (
        `<li key=${index}><strong>${collab.name}</strong> - ${collab.institution}</li>`
      )).join('')}
    </ul>`
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the profile data to your backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any unsaved changes
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleAddItem = (field, newItem) => {
    setProfile(prev => ({
      ...prev,
      [field]: [...prev[field], newItem]
    }));
  };

  const handleRemoveItem = (field, index) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSectionSave = (section, content) => {
    setProfileData(prev => ({
      ...prev,
      [section]: content
    }));
  };

  const renderEditableField = (label, field, value, type = 'text') => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-blue-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full bg-[#1e1e2f] border border-blue-700/30 rounded-xl px-4 py-2 text-white"
      />
    </div>
  );

  const renderEditableArray = (label, field, items) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-blue-300">{label}</label>
        <button
          onClick={() => handleAddItem(field, '')}
          className="text-blue-400 hover:text-blue-300"
        >
          <HiPlus className="w-5 h-5" />
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleArrayInputChange(field, index, e.target.value)}
            className="flex-1 bg-[#1e1e2f] border border-blue-700/30 rounded-xl px-4 py-2 text-white"
          />
          <button
            onClick={() => handleRemoveItem(field, index)}
            className="text-red-400 hover:text-red-300"
          >
            <HiTrash className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );

  const renderTabs = () => (
    <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
      {['overview', 'publications', 'projects', 'achievements', 'collaborations'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === tab
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-blue-300 hover:bg-blue-500/10 hover:text-blue-400'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="bg-[#1e3a8a]/20 rounded-2xl p-8 backdrop-blur-lg border border-blue-700/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {renderEditableField('Name', 'name', profile.name)}
              {renderEditableField('Email', 'email', profile.email, 'email')}
              {renderEditableField('University', 'university', profile.university)}
              {renderEditableField('Department', 'department', profile.department)}
              {renderEditableField('Bio', 'bio', profile.bio, 'textarea')}
            </div>
            <div>
              {renderEditableArray('Research Interests', 'researchInterests', profile.researchInterests)}
              {renderEditableArray('Skills', 'skills', profile.skills)}
              {renderEditableArray('Preferred Locations', 'preferredLocations', profile.preferredLocations)}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl border border-blue-700/30 text-blue-300 hover:bg-blue-500/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 flex items-center space-x-2"
            >
              <HiSave className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <div className="bg-[#1e3a8a]/10 backdrop-blur-sm border border-blue-700/20 rounded-xl p-6 mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Your Research Profile</h1>
              <p className="text-blue-300/80">Manage and update your research information</p>
            </div>

            <div className="space-y-8">
              <EditableSection
                title="Overview"
                content={profileData.overview}
                onSave={(content) => handleSectionSave('overview', content)}
              />
            </div>
          </motion.div>
        );
      
      case 'publications':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <div className="bg-[#1e3a8a]/10 backdrop-blur-sm border border-blue-700/20 rounded-xl p-6 mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Publications</h1>
              <p className="text-blue-300/80">List of publications</p>
            </div>

            <div className="space-y-8">
              <EditableSection
                title="Publications"
                content={profileData.publications}
                onSave={(content) => handleSectionSave('publications', content)}
              />
            </div>
          </motion.div>
        );

      case 'projects':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <div className="bg-[#1e3a8a]/10 backdrop-blur-sm border border-blue-700/20 rounded-xl p-6 mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
              <p className="text-blue-300/80">List of projects</p>
            </div>

            <div className="space-y-8">
              <EditableSection
                title="Projects"
                content={profileData.projects}
                onSave={(content) => handleSectionSave('projects', content)}
              />
            </div>
          </motion.div>
        );

      case 'achievements':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <div className="bg-[#1e3a8a]/10 backdrop-blur-sm border border-blue-700/20 rounded-xl p-6 mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
              <p className="text-blue-300/80">List of achievements</p>
            </div>

            <div className="space-y-8">
              <EditableSection
                title="Achievements"
                content={profileData.achievements}
                onSave={(content) => handleSectionSave('achievements', content)}
              />
            </div>
          </motion.div>
        );

      case 'collaborations':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <div className="bg-[#1e3a8a]/10 backdrop-blur-sm border border-blue-700/20 rounded-xl p-6 mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Collaborations</h1>
              <p className="text-blue-300/80">List of collaborations</p>
            </div>

            <div className="space-y-8">
              <EditableSection
                title="Collaborations"
                content={profileData.collaborations}
                onSave={(content) => handleSectionSave('collaborations', content)}
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e2f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <HiAcademicCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{profile.name}</h1>
              <p className="text-xl text-blue-300">{profile.department} • {profile.university}</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center space-x-2"
            >
              <HiPencil className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          ) : null}
        </div>

        {renderTabs()}
        {renderContent()}
      </main>
    </div>
  );
};

export default Profile;
