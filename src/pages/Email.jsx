import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiAcademicCap,
  HiMail,
  HiLightningBolt,
  HiClipboardCopy,
  HiCheck,
  HiChartBar,
  HiExclamation,
  HiInformationCircle,
  HiArrowRight,
} from 'react-icons/hi';
import { generateTemplateEmail, analyzeProfessorProfile, analyzeResearchFit } from '../services/emailService';

const Email = () => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [professorUrl, setProfessorUrl] = useState('');
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    research: '',
    experience: '',
    education: ''
  });
  const [professorInfo, setProfessorInfo] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [researchFit, setResearchFit] = useState(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const analyzeProfessor = async () => {
    setLoading(true);
    setError('');
    try {
      const info = await analyzeProfessorProfile(professorUrl);
      setProfessorInfo(info);
      setCurrentStep(2);
    } catch (err) {
      setError('Failed to analyze professor profile. Please check the URL and try again.');
    }
    setLoading(false);
  };

  const generateEmailContent = async () => {
    setLoading(true);
    setError('');
    try {
      const email = await generateTemplateEmail(studentInfo, professorInfo);
      const fit = await analyzeResearchFit(studentInfo.research, professorInfo.research);
      setGeneratedEmail(email);
      setResearchFit(fit);
      setCurrentStep(3);
    } catch (err) {
      setError('Failed to generate email. Please try again.');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1e1e3f] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <HiMail className="w-10 h-10 text-blue-400" />
          <div>
            <h1 className="text-4xl font-bold">Email Generator</h1>
            <p className="text-blue-300 mt-1">AI-powered email generation for PhD applications</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-900 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0" style={{ width: `${((currentStep - 1) / 2) * 100}%` }} />
          
          {[1, 2, 3].map((step) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-500' : 'bg-blue-900'}`}>
                {currentStep > step ? (
                  <HiCheck className="w-6 h-6" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span className="mt-2 text-sm text-blue-300">
                {step === 1 ? 'Analyze Profile' : step === 2 ? 'Your Info' : 'Generate Email'}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Professor Profile Analysis */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1e3a8a]/50 rounded-2xl p-8 mb-6 border border-blue-500/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <HiAcademicCap className="w-7 h-7 text-blue-400" />
                <h2 className="text-2xl font-semibold">Professor Profile Analysis</h2>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); analyzeProfessor(); }} className="space-y-6">
                <div>
                  <label className="block text-blue-200 mb-2">Professor's Profile URL</label>
                  <input
                    type="url"
                    value={professorUrl}
                    onChange={(e) => setProfessorUrl(e.target.value)}
                    className="w-full bg-[#1e1e3f] border border-blue-500/30 rounded-xl px-6 py-4 text-white placeholder-blue-300 text-lg focus:border-blue-400 transition-colors"
                    placeholder="https://university.edu/professor"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 text-lg font-medium"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                  ) : (
                    <>
                      <HiLightningBolt className="w-6 h-6" />
                      Analyze Profile
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Student Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1e3a8a]/50 rounded-2xl p-8 mb-6 border border-blue-500/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <HiAcademicCap className="w-7 h-7 text-blue-400" />
                <h2 className="text-2xl font-semibold">Your Information</h2>
              </div>

              {professorInfo && (
                <div className="mb-8 bg-blue-900/30 rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-lg font-medium text-blue-200 mb-3">Professor Analysis</h3>
                  <div className="text-blue-100 whitespace-pre-wrap">{professorInfo}</div>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); generateEmailContent(); }} className="space-y-6">
                <div>
                  <label className="block text-blue-200 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={studentInfo.name}
                    onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                    className="w-full bg-[#1e1e3f] border border-blue-500/30 rounded-xl px-6 py-4 text-white placeholder-blue-300 text-lg"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-200 mb-2">Research Interests</label>
                  <textarea
                    value={studentInfo.research}
                    onChange={(e) => setStudentInfo({ ...studentInfo, research: e.target.value })}
                    className="w-full bg-[#1e1e3f] border border-blue-500/30 rounded-xl px-6 py-4 text-white placeholder-blue-300 text-lg h-32"
                    placeholder="Describe your research interests..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-200 mb-2">Relevant Experience</label>
                  <textarea
                    value={studentInfo.experience}
                    onChange={(e) => setStudentInfo({ ...studentInfo, experience: e.target.value })}
                    className="w-full bg-[#1e1e3f] border border-blue-500/30 rounded-xl px-6 py-4 text-white placeholder-blue-300 text-lg h-32"
                    placeholder="List your relevant experience..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-200 mb-2">Education Background</label>
                  <textarea
                    value={studentInfo.education}
                    onChange={(e) => setStudentInfo({ ...studentInfo, education: e.target.value })}
                    className="w-full bg-[#1e1e3f] border border-blue-500/30 rounded-xl px-6 py-4 text-white placeholder-blue-300 text-lg h-32"
                    placeholder="Describe your educational background..."
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-blue-900/50 hover:bg-blue-900/70 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors text-lg font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 text-lg font-medium"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                    ) : (
                      <>
                        <HiMail className="w-6 h-6" />
                        Generate Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: Generated Content */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-6"
            >
              {/* Email */}
              <div className="bg-[#1e3a8a]/50 rounded-2xl p-8 border border-blue-500/30">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <HiMail className="w-7 h-7 text-blue-400" />
                    <h2 className="text-2xl font-semibold">Generated Email</h2>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-xl transition-colors"
                  >
                    {copied ? (
                      <>
                        <HiCheck className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <HiClipboardCopy className="w-5 h-5" />
                        Copy Email
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-[#1e1e3f] border border-blue-500/30 rounded-xl p-6 whitespace-pre-wrap text-blue-100">
                  {generatedEmail}
                </div>
              </div>

              {/* Research Fit Analysis */}
              <div className="bg-[#1e3a8a]/50 rounded-2xl p-8 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <HiChartBar className="w-7 h-7 text-blue-400" />
                  <h2 className="text-2xl font-semibold">Research Fit Analysis</h2>
                </div>
                <div className="bg-[#1e1e3f] border border-blue-500/30 rounded-xl p-6 whitespace-pre-wrap text-blue-100">
                  {researchFit}
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={() => setCurrentStep(2)}
                className="col-span-2 bg-blue-900/50 hover:bg-blue-900/70 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors text-lg font-medium"
              >
                Edit Information
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 text-red-200 p-6 rounded-xl mt-6 flex items-center gap-3"
          >
            <HiExclamation className="w-6 h-6 text-red-500" />
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Email;
