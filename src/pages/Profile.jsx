import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import EditableSection from '../components/EditableSection';
import { motion, AnimatePresence } from 'framer-motion';
import { HiAcademicCap, HiPencil, HiSave, HiX, HiPlus, HiTrash } from 'react-icons/hi';
import { HiBeaker, HiBookOpen, HiChip, HiClock, HiDocumentText, HiGlobe, HiLightBulb, HiLocationMarker, HiMail, HiUserGroup } from 'react-icons/hi';
import EditProfileModal from '../components/EditProfileModal';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    position: '',
    university: '',
    department: '',
    advisor: '',
    graduationYear: '',
    currentLocation: '',
    bio: '',
    sop: '', // Add SOP field
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      googleScholar: ''
    },
    researchInterests: [],
    keywords: [],
    programmingLanguages: [],
    frameworks: [],
    tools: [],
    publications: [],
    projects: [],
    degrees: [],
    achievements: [],
    collaborations: []
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiUserGroup },
    { id: 'research', label: 'Research', icon: HiBeaker },
    { id: 'sop', label: 'Statement of Purpose', icon: HiDocumentText }, // Add SOP tab
    { id: 'publications', label: 'Publications', icon: HiDocumentText },
    { id: 'projects', label: 'Projects', icon: HiLightBulb },
    { id: 'skills', label: 'Skills', icon: HiChip },
    { id: 'education', label: 'Education', icon: HiAcademicCap },
    { id: 'achievements', label: 'Achievements', icon: HiBookOpen },
    { id: 'service', label: 'Service', icon: HiGlobe }
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedProfile) => {
    const mergedProfile = {
      ...profile,
      ...updatedProfile
    };
    setProfile(mergedProfile);
    setIsEditing(false);
    localStorage.setItem('userProfile', JSON.stringify(mergedProfile));
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const EmptyState = ({ message, onAdd }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-xl">
      <div className="text-gray-400 mb-4">{message}</div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
      >
        <HiPlus className="w-5 h-5" />
        Add Now
      </button>
    </div>
  );

  const renderPublications = () => (
    <div className="space-y-6">
      {profile.publications.length === 0 ? (
        <EmptyState
          message="No publications added yet"
          onAdd={handleEdit}
        />
      ) : (
        profile.publications.map((pub, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{pub.title}</h3>
                <p className="text-gray-400">{pub.authors?.join(', ')}</p>
                <p className="text-blue-300">{pub.journal} • {pub.year}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Impact Factor: {pub.impact}</span>
                  <span>Citations: {pub.citations}</span>
                  <span>DOI: {pub.doi}</span>
                </div>
              </div>
              {pub.link && (
                <a
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20"
                >
                  View Paper
                </a>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      {profile.projects.length === 0 ? (
        <EmptyState
          message="No projects added yet"
          onAdd={handleEdit}
        />
      ) : (
        profile.projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <p className="text-gray-400">{project.role}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                project.status === 'Ongoing'
                  ? 'bg-green-500/10 text-green-300'
                  : 'bg-gray-500/10 text-gray-300'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-300">{project.description}</p>
            {project.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {project.outcomes?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Key Outcomes:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {project.outcomes.map((outcome, i) => (
                    <li key={i}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{project.startDate} - {project.endDate || 'Present'}</span>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200"
                >
                  View Project →
                </a>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-8">
      {profile.programmingLanguages.length === 0 &&
       profile.frameworks.length === 0 &&
       profile.tools.length === 0 ? (
        <EmptyState
          message="No skills added yet"
          onAdd={handleEdit}
        />
      ) : (
        <>
          {profile.programmingLanguages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Programming Languages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.programmingLanguages.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 flex justify-between items-center"
                  >
                    <span className="text-gray-300">{skill.name}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      skill.level === 'Expert'
                        ? 'bg-green-500/10 text-green-300'
                        : skill.level === 'Intermediate'
                        ? 'bg-blue-500/10 text-blue-300'
                        : 'bg-purple-500/10 text-purple-300'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.frameworks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Frameworks & Libraries</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.frameworks.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 flex justify-between items-center"
                  >
                    <span className="text-gray-300">{skill.name}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      skill.level === 'Expert'
                        ? 'bg-green-500/10 text-green-300'
                        : skill.level === 'Intermediate'
                        ? 'bg-blue-500/10 text-blue-300'
                        : 'bg-purple-500/10 text-purple-300'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.tools.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Tools & Technologies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.tools.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 flex justify-between items-center"
                  >
                    <span className="text-gray-300">{skill.name}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      skill.level === 'Expert'
                        ? 'bg-green-500/10 text-green-300'
                        : skill.level === 'Intermediate'
                        ? 'bg-blue-500/10 text-blue-300'
                        : 'bg-purple-500/10 text-purple-300'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      {profile.degrees.length === 0 ? (
        <EmptyState
          message="No education history added yet"
          onAdd={handleEdit}
        />
      ) : (
        profile.degrees.map((degree, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{degree.degree}</h3>
                <p className="text-gray-400">{degree.university}</p>
              </div>
              <span className="text-gray-400">{degree.year}</span>
            </div>
            {degree.thesis && (
              <p className="text-gray-300">Thesis: {degree.thesis}</p>
            )}
          </motion.div>
        ))
      )}
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      {profile.achievements.length === 0 ? (
        <EmptyState
          message="No achievements added yet"
          onAdd={handleEdit}
        />
      ) : (
        profile.achievements.map((achievement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-6 space-y-2"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-white">{achievement.title}</h3>
              <span className="text-gray-400">{achievement.year}</span>
            </div>
            <p className="text-gray-300">{achievement.description}</p>
            {achievement.link && (
              <a
                href={achievement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200"
              >
                Learn More →
              </a>
            )}
          </motion.div>
        ))
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Bio Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e1f2e] rounded-xl p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-white">About Me</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            Edit Bio
          </button>
        </div>
        {profile.bio ? (
          <div className="text-gray-300 whitespace-pre-wrap">{profile.bio}</div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            Add a bio to tell others about yourself and your research journey
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <section>
        <h3 className="text-xl font-semibold text-white mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-gray-400 mb-1">Publications</div>
            <div className="text-2xl font-bold text-white">
              {profile.publications.length}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-gray-400 mb-1">Projects</div>
            <div className="text-2xl font-bold text-white">
              {profile.projects.length}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-gray-400 mb-1">Collaborations</div>
            <div className="text-2xl font-bold text-white">
              {profile.collaborations.length}
            </div>
          </div>
        </div>
      </section>

      {/* Research Interests */}
      <section>
        <h3 className="text-xl font-semibold text-white mb-4">
          Research Interests
        </h3>
        {profile.researchInterests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.researchInterests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No research interests added yet"
            onAdd={handleEdit}
          />
        )}
      </section>
    </div>
  );

  const renderSOP = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Statement of Purpose</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <HiPencil className="w-5 h-5" />
            Edit
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={profile.sop}
            onChange={(e) => setProfile({ ...profile, sop: e.target.value })}
            placeholder="Write your Statement of Purpose here..."
            className="w-full h-64 px-4 py-3 bg-white/10 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(profile)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <HiSave className="w-5 h-5" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none">
          {profile.sop ? (
            <p className="text-gray-300 whitespace-pre-wrap">{profile.sop}</p>
          ) : (
            <EmptyState
              message="No Statement of Purpose added yet"
              onAdd={handleEdit}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b14]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {profile.name ? profile.name : 'Create Your Profile'}
          </h1>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            <HiPencil className="w-5 h-5" />
            {profile.name ? 'Edit Profile' : 'Create Profile'}
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tabs */}
          <div className="flex space-x-1 bg-white/5 p-1 rounded-xl mb-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-8"
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'publications' && renderPublications()}
              {activeTab === 'projects' && renderProjects()}
              {activeTab === 'skills' && renderSkills()}
              {activeTab === 'education' && renderEducation()}
              {activeTab === 'achievements' && renderAchievements()}
              {activeTab === 'sop' && renderSOP()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          profile={profile}
          isOpen={isEditing}
          onClose={handleCancel}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default Profile;
