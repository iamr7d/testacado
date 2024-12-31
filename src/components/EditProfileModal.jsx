import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiAcademicCap, HiPencil, HiSave, HiX, HiPlus, HiTrash } from 'react-icons/hi';
import { HiBeaker, HiChip, HiClock, HiLocationMarker, HiUserGroup } from 'react-icons/hi';

const PROGRAMMING_LANGUAGES = [
  'Python', 'JavaScript', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Go', 'Rust',
  'TypeScript', 'Kotlin', 'R', 'MATLAB', 'Scala', 'Perl', 'Haskell', 'Dart'
].sort();

const FRAMEWORKS = [
  'React', 'Angular', 'Vue.js', 'Django', 'Flask', 'Spring', 'Express.js', 'Laravel',
  'Ruby on Rails', 'ASP.NET', 'TensorFlow', 'PyTorch', 'Node.js', 'Next.js', 'Svelte',
  'FastAPI', 'Symfony', 'Flutter', 'Xamarin', 'Unity'
].sort();

const TOOLS = [
  'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jenkins', 'Jira',
  'VS Code', 'PyCharm', 'IntelliJ IDEA', 'Postman', 'Figma', 'Adobe XD', 'Sketch',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch'
].sort();

const EditProfileModal = ({ profile, isOpen, onClose, onSave }) => {
  const [editedProfile, setEditedProfile] = useState(profile);
  const [activeSection, setActiveSection] = useState('personal');
  const [searchQuery, setSearchQuery] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: HiUserGroup },
    { id: 'academic', label: 'Academic', icon: HiAcademicCap },
    { id: 'research', label: 'Research', icon: HiBeaker },
    { id: 'skills', label: 'Skills', icon: HiChip },
    { id: 'location', label: 'Location', icon: HiLocationMarker },
    { id: 'availability', label: 'Availability', icon: HiClock }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!editedProfile.name) newErrors.name = 'Name is required';
    if (!editedProfile.email) newErrors.email = 'Email is required';
    if (editedProfile.email && !/\S+@\S+\.\S+/.test(editedProfile.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const generateUserBio = (profile) => {
    const sections = [];
    const {
      personalInfo = {},
      academic = {},
      research = {},
      skills = {},
      location = {},
      availability = {}
    } = profile;

    // Introduction
    const introLines = [];
    if (academic.degree || personalInfo.institution) {
      introLines.push(`I am a ${academic.degree || ''} ${personalInfo.position || 'researcher'}${
        personalInfo.institution ? ` at ${personalInfo.institution}` : ''
      }`);
    }
    if (research.field) {
      introLines.push(`specializing in ${research.field}`);
    }
    if (introLines.length > 0) {
      sections.push(introLines.join(' ') + '.');
    }

    // Research Bio
    if (research.bio) {
      sections.push(research.bio);
    }

    // Research Interests
    const researchLines = [];
    if (research.interests?.length > 0) {
      researchLines.push('Research Interests:\n• ' + research.interests.join('\n• '));
    }
    if (research.keywords?.length > 0) {
      researchLines.push('\nKeywords: ' + research.keywords.join(', '));
    }
    if (researchLines.length > 0) {
      sections.push(researchLines.join('\n'));
    }

    // Technical Skills
    const skillLines = [];
    const programmingLanguages = (skills.programmingLanguages || [])
      .filter(lang => lang.name)
      .map(lang => lang.name);
    const frameworks = (skills.frameworks || [])
      .filter(fw => fw.name)
      .map(fw => fw.name);
    const tools = (skills.tools || [])
      .filter(tool => tool.name)
      .map(tool => tool.name);

    if (programmingLanguages.length > 0) {
      skillLines.push('• Programming Languages: ' + programmingLanguages.join(', '));
    }
    if (frameworks.length > 0) {
      skillLines.push('• Frameworks & Libraries: ' + frameworks.join(', '));
    }
    if (tools.length > 0) {
      skillLines.push('• Tools & Technologies: ' + tools.join(', '));
    }
    if (skillLines.length > 0) {
      sections.push('Technical Expertise:\n' + skillLines.join('\n'));
    }

    // Location & Availability
    const locationLines = [];
    if (location.current) {
      locationLines.push(`• Location: ${location.current}`);
    }
    if (location.timezone) {
      locationLines.push(`• Time Zone: ${location.timezone}`);
    }
    if (location.workLocation) {
      locationLines.push(`• Work Preference: ${location.workLocation}`);
    }
    if (availability.status) {
      locationLines.push(`• Current Status: ${availability.status}`);
    }
    if (availability.noticeRequired && availability.noticePeriod) {
      locationLines.push(`• Notice Period: ${availability.noticePeriod}`);
    }
    if (locationLines.length > 0) {
      sections.push('Location & Availability:\n' + locationLines.join('\n'));
    }

    // Join all sections with double newlines
    return sections.join('\n\n');
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const generatedBio = generateUserBio(editedProfile);
      const updatedProfile = {
        ...editedProfile,
        bio: generatedBio
      };
      onSave(updatedProfile);
    }
  };

  const renderField = (label, value, onChange, type = 'text', error, placeholder) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 bg-white/5 border ${
          error ? 'border-red-500' : 'border-white/10'
        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );

  const filterItems = (items) => {
    if (!searchQuery[activeSection]) return items;
    return items.filter(item => 
      item.toLowerCase().includes(searchQuery[activeSection].toLowerCase())
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1b26] rounded-2xl shadow-xl">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-[#1a1b26] border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex">
              <div className="w-48 p-4 border-r border-white/10">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center w-full px-4 py-2 rounded-lg text-left ${
                      activeSection === section.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <section.icon className="w-5 h-5 mr-2" />
                    {section.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                  {activeSection === 'personal' && (
                    <div className="space-y-6">
                      {renderField('Name', editedProfile.name, (value) => handleChange('name', value), 'text', errors.name)}
                      {renderField('Email', editedProfile.email, (value) => handleChange('email', value), 'email', errors.email)}
                      {renderField('Phone', editedProfile.phone, (value) => handleChange('phone', value), 'tel')}
                      {renderField('Website', editedProfile.website, (value) => handleChange('website', value), 'url')}
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Social Links</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {renderField('Github', editedProfile.github, (value) => handleChange('github', value), 'url')}
                          {renderField('Linkedin', editedProfile.linkedin, (value) => handleChange('linkedin', value), 'url')}
                          {renderField('Twitter', editedProfile.twitter, (value) => handleChange('twitter', value), 'url')}
                          {renderField('GoogleScholar', editedProfile.googleScholar, (value) => handleChange('googleScholar', value), 'url')}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'academic' && (
                    <div className="space-y-6">
                      {renderField('University', editedProfile.university, (value) => handleChange('university', value), 'text')}
                      {renderField('Department', editedProfile.department, (value) => handleChange('department', value), 'text')}
                      {renderField('Position', editedProfile.position, (value) => handleChange('position', value), 'text')}
                      {renderField('Advisor', editedProfile.advisor, (value) => handleChange('advisor', value), 'text')}
                      {renderField('Graduation Year', editedProfile.graduationYear, (value) => handleChange('graduationYear', value), 'number')}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-white">Degrees</h3>
                          <button
                            type="button"
                            onClick={() => {
                              const newDegrees = [...(editedProfile.degrees || []), { 
                                degree: '', 
                                university: '', 
                                year: '', 
                                thesis: '' 
                              }];
                              handleChange('degrees', newDegrees);
                            }}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            <HiPlus className="w-4 h-4" />
                            Add Degree
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {(editedProfile.degrees || []).map((degree, index) => (
                            <div key={index} className="p-4 bg-white/5 rounded-xl space-y-4">
                              {renderField('Degree Title', degree.degree, 
                                (value) => {
                                  const newDegrees = [...(editedProfile.degrees || [])];
                                  newDegrees[index] = { ...degree, degree: value };
                                  handleChange('degrees', newDegrees);
                                }, 'text')}
                              {renderField('Institution', degree.university,
                                (value) => {
                                  const newDegrees = [...(editedProfile.degrees || [])];
                                  newDegrees[index] = { ...degree, university: value };
                                  handleChange('degrees', newDegrees);
                                }, 'text')}
                              {renderField('Year', degree.year,
                                (value) => {
                                  const newDegrees = [...(editedProfile.degrees || [])];
                                  newDegrees[index] = { ...degree, year: value };
                                  handleChange('degrees', newDegrees);
                                }, 'number')}
                              {renderField('Thesis Title', degree.thesis,
                                (value) => {
                                  const newDegrees = [...(editedProfile.degrees || [])];
                                  newDegrees[index] = { ...degree, thesis: value };
                                  handleChange('degrees', newDegrees);
                                }, 'text')}
                              <button
                                type="button"
                                onClick={() => {
                                  const newDegrees = editedProfile.degrees.filter((_, i) => i !== index);
                                  handleChange('degrees', newDegrees);
                                }}
                                className="flex items-center gap-2 text-red-400 hover:text-red-300"
                              >
                                <HiTrash className="w-5 h-5" />
                                Remove Degree
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'research' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">Bio</label>
                        <textarea
                          value={editedProfile.bio || ''}
                          onChange={(e) => handleChange('bio', e.target.value)}
                          rows={4}
                          placeholder="Write about your research journey and interests..."
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-white">Research Interests</h3>
                          <button
                            type="button"
                            onClick={() => {
                              const newInterests = [...(editedProfile.researchInterests || []), ''];
                              handleChange('researchInterests', newInterests);
                            }}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            <HiPlus className="w-4 h-4" />
                            Add Interest
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(editedProfile.researchInterests || []).map((interest, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={interest}
                                onChange={(e) => {
                                  const newInterests = [...(editedProfile.researchInterests || [])];
                                  newInterests[index] = e.target.value;
                                  handleChange('researchInterests', newInterests);
                                }}
                                placeholder="Enter research interest"
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newInterests = editedProfile.researchInterests.filter((_, i) => i !== index);
                                  handleChange('researchInterests', newInterests);
                                }}
                                className="p-2 text-red-400 hover:text-red-300"
                              >
                                <HiTrash className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-white">Keywords</h3>
                          <button
                            type="button"
                            onClick={() => {
                              const newKeywords = [...(editedProfile.keywords || []), ''];
                              handleChange('keywords', newKeywords);
                            }}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            <HiPlus className="w-4 h-4" />
                            Add Keyword
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(editedProfile.keywords || []).map((keyword, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={keyword}
                                onChange={(e) => {
                                  const newKeywords = [...(editedProfile.keywords || [])];
                                  newKeywords[index] = e.target.value;
                                  handleChange('keywords', newKeywords);
                                }}
                                placeholder="Enter keyword"
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newKeywords = editedProfile.keywords.filter((_, i) => i !== index);
                                  handleChange('keywords', newKeywords);
                                }}
                                className="p-2 text-red-400 hover:text-red-300"
                              >
                                <HiTrash className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'skills' && (
                    <div className="space-y-12">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl">
                            <span className="text-white">Programming</span>
                            <span className="text-gray-400"> Languages</span>
                          </h3>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search languages..."
                              value={searchQuery[activeSection] || ''}
                              onChange={(e) => setSearchQuery(prev => ({ ...prev, [activeSection]: e.target.value }))}
                              className="px-4 py-2 bg-[#1e1f2e] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute right-0 top-full mt-2 w-64 max-h-60 overflow-y-auto bg-[#1e1f2e] rounded-xl shadow-lg z-50">
                              {searchQuery[activeSection] && filterItems(PROGRAMMING_LANGUAGES).map((lang) => (
                                <button
                                  key={lang}
                                  onClick={() => {
                                    const newSkills = [...(editedProfile.programmingLanguages || []), { name: lang, level: 'Intermediate' }];
                                    handleChange('programmingLanguages', newSkills);
                                    setSearchQuery(prev => ({ ...prev, [activeSection]: '' }));
                                  }}
                                  className="w-full px-4 py-2 text-left text-white hover:bg-blue-500 transition-colors"
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {(!editedProfile.programmingLanguages || editedProfile.programmingLanguages.length === 0) ? (
                          <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-[#1e1f2e]">
                            <p className="text-gray-400 mb-4">No programming languages added yet</p>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search and select a language..."
                                value={searchQuery[activeSection] || ''}
                                onChange={(e) => setSearchQuery(prev => ({ ...prev, [activeSection]: e.target.value }))}
                                className="w-64 px-4 py-2 bg-[#2a2b3d] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="absolute left-0 top-full mt-2 w-64 max-h-60 overflow-y-auto bg-[#1e1f2e] rounded-xl shadow-lg z-50">
                                {searchQuery[activeSection] && filterItems(PROGRAMMING_LANGUAGES).map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => {
                                      const newSkills = [...(editedProfile.programmingLanguages || []), { name: lang, level: 'Intermediate' }];
                                      handleChange('programmingLanguages', newSkills);
                                      setSearchQuery(prev => ({ ...prev, [activeSection]: '' }));
                                    }}
                                    className="w-full px-4 py-2 text-left text-white hover:bg-blue-500 transition-colors"
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {editedProfile.programmingLanguages.map((skill, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1f2e]">
                                <div className="flex-1 px-4 py-2 text-white">{skill.name}</div>
                                <select
                                  value={skill.level}
                                  onChange={(e) => {
                                    const newSkills = [...editedProfile.programmingLanguages];
                                    newSkills[index] = { ...skill, level: e.target.value };
                                    handleChange('programmingLanguages', newSkills);
                                  }}
                                  className="px-4 py-2 bg-[#2a2b3d] rounded-lg text-white focus:outline-none"
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Expert">Expert</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSkills = editedProfile.programmingLanguages.filter((_, i) => i !== index);
                                    handleChange('programmingLanguages', newSkills);
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <HiTrash className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl">
                            <span className="text-white">Frameworks</span>
                            <span className="text-gray-400"> & Libraries</span>
                          </h3>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search frameworks..."
                              value={searchQuery[activeSection] || ''}
                              onChange={(e) => setSearchQuery(prev => ({ ...prev, [activeSection]: e.target.value }))}
                              className="px-4 py-2 bg-[#1e1f2e] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute right-0 top-full mt-2 w-64 max-h-60 overflow-y-auto bg-[#1e1f2e] rounded-xl shadow-lg z-50">
                              {searchQuery[activeSection] && filterItems(FRAMEWORKS).map((lang) => (
                                <button
                                  key={lang}
                                  onClick={() => {
                                    const newSkills = [...(editedProfile.frameworks || []), { name: lang, level: 'Intermediate' }];
                                    handleChange('frameworks', newSkills);
                                    setSearchQuery(prev => ({ ...prev, [activeSection]: '' }));
                                  }}
                                  className="w-full px-4 py-2 text-left text-white hover:bg-blue-500 transition-colors"
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {(!editedProfile.frameworks || editedProfile.frameworks.length === 0) ? (
                          <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-[#1e1f2e]">
                            <p className="text-gray-400 mb-4">No frameworks & libraries added yet</p>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search and select a framework..."
                                value={searchQuery[activeSection] || ''}
                                onChange={(e) => setSearchQuery(prev => ({ ...prev, [activeSection]: e.target.value }))}
                                className="w-64 px-4 py-2 bg-[#2a2b3d] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="absolute left-0 top-full mt-2 w-64 max-h-60 overflow-y-auto bg-[#1e1f2e] rounded-xl shadow-lg z-50">
                                {searchQuery[activeSection] && filterItems(FRAMEWORKS).map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => {
                                      const newSkills = [...(editedProfile.frameworks || []), { name: lang, level: 'Intermediate' }];
                                      handleChange('frameworks', newSkills);
                                      setSearchQuery(prev => ({ ...prev, [activeSection]: '' }));
                                    }}
                                    className="w-full px-4 py-2 text-left text-white hover:bg-blue-500 transition-colors"
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {editedProfile.frameworks.map((skill, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1f2e]">
                                <div className="flex-1 px-4 py-2 text-white">{skill.name}</div>
                                <select
                                  value={skill.level}
                                  onChange={(e) => {
                                    const newSkills = [...editedProfile.frameworks];
                                    newSkills[index] = { ...skill, level: e.target.value };
                                    handleChange('frameworks', newSkills);
                                  }}
                                  className="px-4 py-2 bg-[#2a2b3d] rounded-lg text-white focus:outline-none"
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Expert">Expert</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSkills = editedProfile.frameworks.filter((_, i) => i !== index);
                                    handleChange('frameworks', newSkills);
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <HiTrash className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl">
                            <span className="text-white">Tools</span>
                            <span className="text-gray-400"> & Technologies</span>
                          </h3>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search tools..."
                              value={searchQuery[activeSection] || ''}
                              onChange={(e) => setSearchQuery(prev => ({ ...prev, [activeSection]: e.target.value }))}
                              className="px-4 py-2 bg-[#1e1f2e] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute right-0 top-full mt-2 w-64 max-h-60 overflow-y-auto bg-[#1e1f2e] rounded-xl shadow-lg z-50">
                              {searchQuery[activeSection] && filterItems(TOOLS).map((lang) => (
                                <button
                                  key={lang}
                                  onClick={() => {
                                    const newSkills = [...(editedProfile.tools || []), { name: lang, level: 'Intermediate' }];
                                    handleChange('tools', newSkills);
                                    setSearchQuery(prev => ({ ...prev, [activeSection]: '' }));
                                  }}
                                  className="w-full px-4 py-2 text-left text-white hover:bg-blue-500 transition-colors"
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {(!editedProfile.tools || editedProfile.tools.length === 0) ? (
                          <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-[#1e1f2e]">
                            <p className="text-gray-400 mb-4">No tools & technologies added yet</p>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search and select a tool..."
                                value={searchQuery[activeSection] || ''}
                                onChange={(e) => setSearchQuery(prev => ({ ...prev, [activeSection]: e.target.value }))}
                                className="w-64 px-4 py-2 bg-[#2a2b3d] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="absolute left-0 top-full mt-2 w-64 max-h-60 overflow-y-auto bg-[#1e1f2e] rounded-xl shadow-lg z-50">
                                {searchQuery[activeSection] && filterItems(TOOLS).map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => {
                                      const newSkills = [...(editedProfile.tools || []), { name: lang, level: 'Intermediate' }];
                                      handleChange('tools', newSkills);
                                      setSearchQuery(prev => ({ ...prev, [activeSection]: '' }));
                                    }}
                                    className="w-full px-4 py-2 text-left text-white hover:bg-blue-500 transition-colors"
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {editedProfile.tools.map((skill, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1f2e]">
                                <div className="flex-1 px-4 py-2 text-white">{skill.name}</div>
                                <select
                                  value={skill.level}
                                  onChange={(e) => {
                                    const newSkills = [...editedProfile.tools];
                                    newSkills[index] = { ...skill, level: e.target.value };
                                    handleChange('tools', newSkills);
                                  }}
                                  className="px-4 py-2 bg-[#2a2b3d] rounded-lg text-white focus:outline-none"
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Expert">Expert</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSkills = editedProfile.tools.filter((_, i) => i !== index);
                                    handleChange('tools', newSkills);
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <HiTrash className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === 'location' && (
                    <div className="space-y-6">
                      {renderField('Current Location', editedProfile.currentLocation, (value) => handleChange('currentLocation', value), 'text')}
                      {renderField('Time Zone', editedProfile.timeZone, (value) => handleChange('timeZone', value), 'text')}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">Preferred Work Location</label>
                        <div className="space-x-4">
                          {['Remote', 'On-site', 'Hybrid'].map(option => (
                            <label key={option} className="inline-flex items-center">
                              <input
                                type="radio"
                                value={option}
                                checked={editedProfile.workLocation === option}
                                onChange={(e) => handleChange('workLocation', e.target.value)}
                                className="form-radio h-4 w-4 text-blue-500 border-white/10 bg-white/5 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-white">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {renderField('Relocation Preferences', editedProfile.relocationPreferences, (value) => handleChange('relocationPreferences', value), 'text', null, 'e.g., "Open to relocate within Europe"')}
                    </div>
                  )}

                  {activeSection === 'availability' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">Current Status</label>
                        <select
                          value={editedProfile.currentStatus || ''}
                          onChange={(e) => handleChange('currentStatus', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select status...</option>
                          <option value="Available">Available</option>
                          <option value="Open to Opportunities">Open to Opportunities</option>
                          <option value="Not Available">Not Available</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">Availability Hours</label>
                        <div className="grid grid-cols-2 gap-4">
                          {renderField('Start Time', editedProfile.availabilityStart, (value) => handleChange('availabilityStart', value), 'time')}
                          {renderField('End Time', editedProfile.availabilityEnd, (value) => handleChange('availabilityEnd', value), 'time')}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">Available Days</label>
                        <div className="grid grid-cols-4 gap-3">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <label key={day} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={(editedProfile.availableDays || []).includes(day)}
                                onChange={(e) => {
                                  const days = new Set(editedProfile.availableDays || []);
                                  if (e.target.checked) {
                                    days.add(day);
                                  } else {
                                    days.delete(day);
                                  }
                                  handleChange('availableDays', Array.from(days));
                                }}
                                className="form-checkbox h-4 w-4 text-blue-500 border-white/10 bg-white/5 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-white">{day.slice(0, 3)}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">Notice Period</label>
                        <input
                          type="text"
                          value={editedProfile.noticePeriod || ''}
                          onChange={(e) => handleChange('noticePeriod', e.target.value)}
                          placeholder="e.g., 2 weeks, 1 month"
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end p-6 bg-[#1a1b26] border-t border-white/10">
              <button
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <HiSave className="w-5 h-5 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
