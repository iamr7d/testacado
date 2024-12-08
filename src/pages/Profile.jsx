import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsUpload, BsCheckCircle, BsXCircle, BsPerson, BsEnvelope, BsPhone, BsGlobe, BsGithub, BsLinkedin } from 'react-icons/bs';

const Profile = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [resumeFile, setResumeFile] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    website: 'https://johndoe.com',
    github: 'github.com/johndoe',
    linkedin: 'linkedin.com/in/johndoe',
    bio: 'PhD Candidate in Computer Science with a focus on AI and Machine Learning',
    interests: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'Natural Language Processing'],
    education: [
      {
        degree: 'MS in Computer Science',
        institution: 'Stanford University',
        year: '2022',
      },
      {
        degree: 'BS in Computer Science',
        institution: 'MIT',
        year: '2020',
      },
    ],
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
      simulateUpload(file);
    }
  };

  const simulateUpload = (file) => {
    setUploadStatus(null);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleProfileUpdate = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
            <div className="flex items-center">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-green-500">
                <BsPerson className="h-12 w-12" />
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-white">{userProfile.name}</h1>
                <p className="text-green-100 mt-1">{userProfile.bio}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <BsEnvelope className="text-gray-400 mr-2" />
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <BsPhone className="text-gray-400 mr-2" />
                <input
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <BsGlobe className="text-gray-400 mr-2" />
                <input
                  type="url"
                  value={userProfile.website}
                  onChange={(e) => handleProfileUpdate('website', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <BsGithub className="text-gray-400 mr-2" />
                <input
                  type="text"
                  value={userProfile.github}
                  onChange={(e) => handleProfileUpdate('github', e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Resume</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="resume-upload"
                  className="w-full flex flex-col items-center justify-center px-4 py-6 bg-white text-green-500 rounded-lg shadow-lg tracking-wide border border-green-500 cursor-pointer hover:bg-green-500 hover:text-white transition-colors duration-300"
                >
                  <BsUpload className="w-8 h-8" />
                  <span className="mt-2 text-base leading-normal">
                    {resumeFile ? resumeFile.name : 'Select your resume'}
                  </span>
                  <input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Upload Progress */}
              <AnimatePresence>
                {uploadProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-4"
                  >
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <motion.div
                        className="bg-green-600 h-2.5 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">{uploadProgress}% uploaded</span>
                      {uploadStatus && (
                        <span className="flex items-center">
                          {uploadStatus === 'success' ? (
                            <BsCheckCircle className="text-green-500 mr-1" />
                          ) : (
                            <BsXCircle className="text-red-500 mr-1" />
                          )}
                          {uploadStatus === 'success' ? 'Upload complete' : 'Upload failed'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Education Section */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Education</h2>
            <div className="space-y-4">
              {userProfile.education.map((edu, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEducation = [...userProfile.education];
                        newEducation[index].degree = e.target.value;
                        handleProfileUpdate('education', newEducation);
                      }}
                      className="p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const newEducation = [...userProfile.education];
                        newEducation[index].institution = e.target.value;
                        handleProfileUpdate('education', newEducation);
                      }}
                      className="p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => {
                        const newEducation = [...userProfile.education];
                        newEducation[index].year = e.target.value;
                        handleProfileUpdate('education', newEducation);
                      }}
                      className="p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </motion.div>
              ))}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const newEducation = [...userProfile.education, {
                    degree: '',
                    institution: '',
                    year: '',
                  }];
                  handleProfileUpdate('education', newEducation);
                }}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Education
              </motion.button>
            </div>
          </div>

          {/* Research Interests */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Research Interests</h2>
            <div className="flex flex-wrap gap-2">
              {userProfile.interests.map((interest, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newInterest = prompt('Enter new research interest:');
                if (newInterest) {
                  handleProfileUpdate('interests', [...userProfile.interests, newInterest]);
                }
              }}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Interest
            </motion.button>
          </div>
        </div>

        {/* Save Changes Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          Save Changes
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
