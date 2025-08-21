import React, { useState, useEffect } from 'react';
import { scraperAPI, admissionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  fatherName: string;
  cnic: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  nationality: string;
  
  // Contact Information
  phoneNumber: string;
  whatsappNumber: string;
  permanentAddress: string;
  city: string;
  province: string;
  
  // Family Information
  fatherOccupation: string;
  fatherIncome: string;
  motherName: string;
  motherOccupation: string;
  
  
  // Academic Information - Inter/A-Levels
  interYear: string;
  interRollNumber: string;
  interTotalMarks: string;
  interObtainedMarks: string;
  interPercentage: string;
  
  // Program Preferences
  preferredProgram1: string;
  preferredProgram2: string;
  preferredProgram3: string;
  
}

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingData, setScrapingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    fatherName: '',
    cnic: '',
    dateOfBirth: '',
    gender: '',
    religion: '',
    nationality: '',

    phoneNumber: '',
    whatsappNumber: '',
    permanentAddress: '',
    city: '',
    province: '',

    fatherOccupation: '',
    fatherIncome: '',
    motherName: '',
    motherOccupation: '',

    interYear: '',
    interRollNumber: '',
    interTotalMarks: '',
    interObtainedMarks: '',
    interPercentage: '',

    preferredProgram1: '',
    preferredProgram2: '',
    preferredProgram3: '',
  });

  // Scraper form state
  const [scraperForm, setScraperForm] = useState({
    rollNumber: '',
    examType: '2',
    year: '2024'
  });
  const [scrapedResult, setScrapedResult] = useState<any>(null);

  const steps = [
    'Personal Information',
    'Contact Information',
    'Family Information',
    'Academic Information',
    'Program Preferences',
    'Review & Submit'
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScraperFormChange = (field: string, value: string) => {
    setScraperForm(prev => ({ ...prev, [field]: value }));
  };

  const handleScrapeData = async () => {
    if (!scraperForm.rollNumber.trim()) {
      setError('Please enter a roll number');
      return;
    }

    setScrapingData(true);
    setError(null);
    setScrapedResult(null);

    try {
      const result = await scraperAPI.scrapeResult({
        roll_number: scraperForm.rollNumber,
        exam_type: scraperForm.examType,
        year: scraperForm.year
      });

      if (result.success && result.data) {
        // Store the scraped result for display
        setScrapedResult(result.data);
        
        // Map scraped data to form fields - only fill the available fields
        const scrapedData = result.data;
        const updates: Partial<FormData> = {};
        
        // Parse student name
        if (scrapedData.studentName && scrapedData.studentName !== 'Not Available') {
          const nameParts = scrapedData.studentName.split(' ');
          updates.firstName = nameParts[0] || '';
          updates.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Father's name
        if (scrapedData.fatherName && scrapedData.fatherName !== 'Not Available') {
          updates.fatherName = scrapedData.fatherName;
        }
        
        // CNIC fields
        if (scrapedData.studentCnic && scrapedData.studentCnic !== 'Not Available') {
          updates.cnic = scrapedData.studentCnic;
        }
        
        // Academic fields
        updates.interRollNumber = scraperForm.rollNumber;
        if (scrapedData.totalMarks) {
          updates.interTotalMarks = scrapedData.totalMarks.toString();
        }
        if (scrapedData.obtainedMarks) {
          updates.interObtainedMarks = scrapedData.obtainedMarks.toString();
        }
        
        // Calculate percentage if not available
        if (scrapedData.totalMarks && scrapedData.obtainedMarks) {
          const percentage = ((scrapedData.obtainedMarks / scrapedData.totalMarks) * 100).toFixed(2);
          updates.interPercentage = `${percentage}%`;
        }
        
        // Apply updates
        setFormData(prev => ({ ...prev, ...updates }));
        setSuccess('Data scraped successfully! Check the result below and form fields have been auto-filled.');
      } else {
        setError('Failed to scrape data. Please check the roll number and try again.');
      }
    } catch (err: any) {
      setError(`Error scraping data: ${err.message}`);
    } finally {
      setScrapingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await admissionsAPI.submitApplicationForm(formData);
      setSuccess('Application form submitted successfully!');
      console.log('Form submission response:', response);
    } catch (err: any) {
      setError(`Error submitting form: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>
            
            {/* Scraper Section */}
            <div className="bg-gradient-to-r from-cyber-600/20 to-cyber-500/20 border border-cyber-500/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Auto-fill from BISE Lahore Result</h4>
              <p className="text-dark-300 text-sm mb-4">
                Enter your intermediate result details to automatically fill form fields
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-dark-400 mb-2">Roll Number</label>
                  <input
                    type="text"
                    value={scraperForm.rollNumber}
                    onChange={(e) => handleScraperFormChange('rollNumber', e.target.value)}
                    placeholder="e.g., 123456"
                    className="cyber-input w-full text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-dark-400 mb-2">Exam Type</label>
                  <select
                    value={scraperForm.examType}
                    onChange={(e) => handleScraperFormChange('examType', e.target.value)}
                    className="cyber-input w-full text-sm"
                  >
                    <option value="2">Part-2 Annual</option>
                    <option value="1">Part-1 Annual</option>
                    <option value="0">Supplementary</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-dark-400 mb-2">Year</label>
                  <select
                    value={scraperForm.year}
                    onChange={(e) => handleScraperFormChange('year', e.target.value)}
                    className="cyber-input w-full text-sm"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleScrapeData}
                    disabled={scrapingData || !scraperForm.rollNumber.trim()}
                    className="cyber-button w-full py-2 text-sm"
                  >
                    {scrapingData ? 'Scraping...' : 'Fetch Result'}
                  </button>
                </div>
              </div>
              
              {/* Result Display */}
              {scrapedResult && (
                <div className="mt-6 p-4 bg-dark-800/50 border border-green-500/30 rounded-lg">
                  <h5 className="text-sm font-semibold text-green-400 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Scraped Result Data
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-dark-400">Student Name:</span> 
                      <span className="text-white ml-1">{scrapedResult.studentName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-dark-400">Father Name:</span> 
                      <span className="text-white ml-1">{scrapedResult.fatherName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-dark-400">Student CNIC:</span> 
                      <span className="text-white ml-1">{scrapedResult.studentCnic || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-dark-400">Father CNIC:</span> 
                      <span className="text-white ml-1">{scrapedResult.fatherCnic || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-dark-400">Total Marks:</span> 
                      <span className="text-white ml-1">{scrapedResult.totalMarks || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-dark-400">Obtained Marks:</span> 
                      <span className="text-white ml-1">{scrapedResult.obtainedMarks || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Father's Name</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter father's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">CNIC</label>
                <input
                  type="text"
                  value={formData.cnic}
                  onChange={(e) => handleInputChange('cnic', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="00000-0000000-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="cyber-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="cyber-input w-full"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-300 mb-2">Permanent Address</label>
                <textarea
                  value={formData.permanentAddress}
                  onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                  className="cyber-input w-full h-24 resize-none"
                  placeholder="Enter permanent address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Province</label>
                <select
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className="cyber-input w-full"
                >
                  <option value="">Select province</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="KPK">KPK</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad">Islamabad</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Father's Occupation</label>
                <input
                  type="text"
                  value={formData.fatherOccupation}
                  onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter father's occupation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Father's Monthly Income</label>
                <input
                  type="text"
                  value={formData.fatherIncome}
                  onChange={(e) => handleInputChange('fatherIncome', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter monthly income"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Mother's Name</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter mother's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Mother's Occupation</label>
                <input
                  type="text"
                  value={formData.motherOccupation}
                  onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter mother's occupation"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Academic Information</h3>
            <div className="bg-dark-800/50 p-6 rounded-xl border border-dark-700">
              <h4 className="text-lg font-semibold text-white mb-4">Inter/A-Levels</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Year</label>
                  <input
                    type="text"
                    value={formData.interYear}
                    onChange={(e) => handleInputChange('interYear', e.target.value)}
                    className="cyber-input w-full"
                    placeholder="e.g., 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Roll Number</label>
                  <input
                    type="text"
                    value={formData.interRollNumber}
                    onChange={(e) => handleInputChange('interRollNumber', e.target.value)}
                    className="cyber-input w-full"
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Total Marks</label>
                  <input
                    type="text"
                    value={formData.interTotalMarks}
                    onChange={(e) => handleInputChange('interTotalMarks', e.target.value)}
                    className="cyber-input w-full"
                    placeholder="e.g., 1100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Obtained Marks</label>
                  <input
                    type="text"
                    value={formData.interObtainedMarks}
                    onChange={(e) => handleInputChange('interObtainedMarks', e.target.value)}
                    className="cyber-input w-full"
                    placeholder="e.g., 950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Percentage</label>
                  <input
                    type="text"
                    value={formData.interPercentage}
                    onChange={(e) => handleInputChange('interPercentage', e.target.value)}
                    className="cyber-input w-full"
                    placeholder="e.g., 86.36%"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Program Preferences</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">First Preference</label>
                <input
                  type="text"
                  value={formData.preferredProgram1}
                  onChange={(e) => handleInputChange('preferredProgram1', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter preferred program"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Second Preference</label>
                <input
                  type="text"
                  value={formData.preferredProgram2}
                  onChange={(e) => handleInputChange('preferredProgram2', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter second preference"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Third Preference</label>
                <input
                  type="text"
                  value={formData.preferredProgram3}
                  onChange={(e) => handleInputChange('preferredProgram3', e.target.value)}
                  className="cyber-input w-full"
                  placeholder="Enter third preference"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Review & Submit</h3>
            <div className="bg-dark-800/50 p-6 rounded-xl border border-dark-700">
              <h4 className="text-lg font-semibold text-white mb-4">Application Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-dark-400">Name:</span> <span className="text-white">{formData.firstName} {formData.lastName}</span></div>
                <div><span className="text-dark-400">Father's Name:</span> <span className="text-white">{formData.fatherName}</span></div>
                <div><span className="text-dark-400">Phone:</span> <span className="text-white">{formData.phoneNumber}</span></div>
                <div><span className="text-dark-400">First Preference:</span> <span className="text-white">{formData.preferredProgram1}</span></div>
                <div><span className="text-dark-400">Inter Percentage:</span> <span className="text-white">{formData.interPercentage}</span></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-cyber-600/20 to-cyber-500/20 border border-cyber-500/30 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <svg className="w-6 h-6 text-cyber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-semibold text-white">Important Notice</h4>
              </div>
              <p className="text-dark-300 text-sm">
                Please review all information carefully before submitting. Once submitted, you won't be able to modify this application.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyber-500/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyber-400/8 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-cyber-600/10 rounded-full blur-md animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold neon-text mb-4">Application Form</h1>
          <p className="text-dark-400">Complete your university admission application</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center ${
                index < steps.length - 1 ? 'flex-1' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= currentStep 
                    ? 'bg-cyber-500 text-white' 
                    : 'bg-dark-700 text-dark-400'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < currentStep ? 'bg-cyber-500' : 'bg-dark-700'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-sm text-dark-400">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="cyber-card p-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentStep === 0
                  ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                  : 'bg-dark-700 text-white hover:bg-dark-600'
              }`}
            >
              Previous
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={() => navigate("/dashboard")}
                type="submit"
                disabled={isLoading}
                className="cyber-button px-8 py-3"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="cyber-button px-6 py-3"
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
