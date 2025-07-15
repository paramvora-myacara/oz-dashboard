'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, UserCheck, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trackUserEvent } from '@/lib/events';

const STEPS = [
  {
    id: 'cap-gain-status',
    title: 'Capital Gain Status',
    subtitle: 'Have you had a capital gain?',
    icon: UserCheck
  },
  {
    id: 'gain-amount',
    title: 'Gain Amount',
    subtitle: 'Roughly how much capital gain are you re-investing?',
    icon: UserCheck
  },
  {
    id: 'gain-timing',
    title: 'Timing',
    subtitle: 'How long has it been since you\'ve had the capital gain?',
    icon: UserCheck
  }
];

const GAIN_AMOUNT_OPTIONS = [
  { id: 'under-50k', label: '<$50K', value: 25000, display: 'Under $50,000' },
  { id: '50k-250k', label: '$50K-$250K', value: 150000, display: '$50,000 - $250,000' },
  { id: '250k-500k', label: '$250K-$500K', value: 375000, display: '$250,000 - $500,000' },
  { id: '500k-1m', label: '$500K-$1M', value: 750000, display: '$500,000 - $1,000,000' },
  { id: 'over-1m', label: '>$1M', value: 2000000, display: 'Over $1,000,000' }
];

const TIMING_OPTIONS = [
  { 
    id: 'past', 
    label: 'Before the last 180 days', 
    value: 'More than 180 days AGO',
    display: 'More than 180 days ago'
  },
  { 
    id: 'recent', 
    label: 'In the last 180 days', 
    value: 'Last 180 days',
    display: 'Within the last 180 days'
  },
  { 
    id: 'future', 
    label: 'Will happen in the future', 
    value: 'Upcoming',
    display: 'Expected in the future'
  }
];

export default function CheckInvestorEligibilityPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    capGainStatus: null,
    gainAmount: null,
    gainTiming: null
  });
  const [showResults, setShowResults] = useState(false);
  const [hasQualified, setHasQualified] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?returnTo=/check-investor-eligibility');
    }
  }, [user, loading, router]);

  const handleStepComplete = async (stepId, value) => {
    const newFormData = { ...formData, [stepId]: value };
    setFormData(newFormData);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate qualification
      const qualifies = newFormData.gainAmount >= 750000; // 500K-1M and above qualify
      setHasQualified(qualifies);
      setShowResults(true);

      // Track the event
      trackUserEvent('investor_qualification_submitted', '/check-investor-eligibility', {
        capGainStatus: newFormData.capGainStatus,
        gainAmount: newFormData.gainAmount,
        gainTiming: newFormData.gainTiming,
        qualified: qualifies
      });
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
      setCurrentStep(STEPS.length - 1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/');
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setFormData({
      capGainStatus: null,
      gainAmount: null,
      gainTiming: null
    });
    setShowResults(false);
    setHasQualified(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071e3] mx-auto mb-4"></div>
          <p className="text-black/60 dark:text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  const currentStepData = STEPS[currentStep];

  if (showResults) {
    return <ResultsScreen qualified={hasQualified} onBack={handleBack} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black px-8 pt-32 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tight mb-4">
            Investor Eligibility Check
          </h1>
          <p className="text-xl text-black/60 dark:text-white/60 font-light">
            See if you qualify to invest in Opportunity Zones
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-black/60 dark:text-white/60">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-black/60 dark:text-white/60">
              {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-3xl p-8 bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-2xl mb-4">
                <currentStepData.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-lg text-black/60 dark:text-white/60 font-light">
                {currentStepData.subtitle}
              </p>
            </div>

            {/* Step 1: Capital Gain Status */}
            {currentStep === 0 && (
              <div className="space-y-4">
                {[
                  { id: true, label: 'Yes', display: 'Yes, I have had a capital gain' },
                  { id: false, label: 'No', display: 'No, I have not had a capital gain' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleStepComplete('capGainStatus', option.id)}
                    className="w-full p-6 text-left glass-card rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-semibold text-black dark:text-white mb-1">
                          {option.label}
                        </div>
                        <div className="text-sm text-black/60 dark:text-white/60">
                          {option.display}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-[#ff6b35] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Gain Amount */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {GAIN_AMOUNT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleStepComplete('gainAmount', option.value)}
                    className="w-full p-6 text-left glass-card rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-semibold text-black dark:text-white mb-1">
                          {option.label}
                        </div>
                        <div className="text-sm text-black/60 dark:text-white/60">
                          {option.display}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-[#ff6b35] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Gain Timing */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {TIMING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleStepComplete('gainTiming', option.value)}
                    className="w-full p-6 text-left glass-card rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-semibold text-black dark:text-white mb-1">
                          {option.label}
                        </div>
                        <div className="text-sm text-black/60 dark:text-white/60">
                          {option.display}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-[#ff6b35] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ qualified, onBack, onReset }) {
  const confettiTrigger = () => {
    if (qualified) {
      console.log('🎉 Confetti for qualified investor!');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black px-8 pt-32 pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={confettiTrigger}
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
              qualified 
                ? 'bg-gradient-to-br from-[#30d158] to-[#40e168]' 
                : 'bg-gradient-to-br from-[#ff375f] to-[#ff6b8a]'
            }`}
          >
            {qualified ? (
              <CheckCircle className="w-10 h-10 text-white" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-white" />
            )}
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tight mb-4">
            {qualified ? 'You Qualify!' : "You Don&apos;t Qualify"}
          </h1>
          <p className="text-xl text-black/60 dark:text-white/60 font-light">
            {qualified 
              ? 'Based on your capital gains, you are eligible to invest in Opportunity Zones'
              : 'Based on your responses, you do not currently qualify for OZ investments'
            }
          </p>
        </div>

        {/* Main Result Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className={`glass-card rounded-3xl p-8 border-2 ${
            qualified 
              ? 'bg-gradient-to-br from-[#30d158]/5 to-[#40e168]/5 border-[#30d158]/20'
              : 'bg-gradient-to-br from-[#ff375f]/5 to-[#ff6b8a]/5 border-[#ff375f]/20'
          }`}>
            {qualified ? (
              <div>
                <h2 className="text-2xl font-semibold text-[#30d158] mb-4">
                  Congratulations! You&apos;re eligible to invest in Opportunity Zones
                </h2>
                <p className="text-lg text-black/70 dark:text-white/70 mb-6">
                  We&apos;ll reach out to you via email soon with next steps and investment opportunities.
                </p>
                <div className="flex items-center justify-center gap-2 text-black/60 dark:text-white/60">
                  <Users className="w-5 h-5" />
                  <span>Our team will contact you shortly</span>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold text-[#ff375f] mb-4">
                  You don&apos;t currently qualify for OZ investments
                </h2>
                <p className="text-lg text-black/70 dark:text-white/70">
                  Based on current qualification requirements, you are not eligible at this time.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={onReset}
            className="px-6 py-3 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
} 