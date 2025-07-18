'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calculator, AlertTriangle, FileText, Phone } from 'lucide-react';
import { 
  GAIN_AMOUNT_OPTIONS, 
  TAX_BRACKET_OPTIONS, 
  HOLD_PERIOD_OPTIONS,
  calculateTaxSavings,
  formatCurrency,
  formatPercentage,
  getGainAmountLabel,
  getTaxBracketLabel,
  TAX_CALC_CONFIG
} from '@/lib/taxCalculator';
import { trackUserEvent } from '@/lib/events';
import ScheduleCallCTA from '@/components/ScheduleCallCTA';

const STEPS = [
  {
    id: 'gain-amount',
    title: 'Capital Gain Amount',
    subtitle: 'Roughly how much capital gain are you re-investing?',
    icon: Calculator
  },
  {
    id: 'tax-bracket',
    title: 'Tax Bracket',
    subtitle: 'Which best matches your combined Fed + State LTCG rate?',
    icon: FileText
  },
  {
    id: 'hold-period',
    title: 'Hold Period',
    subtitle: 'Will you keep the OZ investment for ≥ 10 years?',
    icon: AlertTriangle
  }
];

export default function TaxCalculatorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    gainAmount: null,
    taxRate: null,
    hold10Years: null
  });
  const [showResults, setShowResults] = useState(false);
  const [calculationResults, setCalculationResults] = useState(null);
  const router = useRouter();

  const handleStepComplete = (stepId, value) => {
    const newFormData = { ...formData, [stepId]: value };
    setFormData(newFormData);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate results
      const results = calculateTaxSavings(
        newFormData.gainAmount,
        newFormData.taxRate,
        newFormData.hold10Years
      );
      setCalculationResults(results);
      setShowResults(true);

      // Track the event
      trackUserEvent('tax_calculator_used', '/tax-calculator', {
        gainAmount: newFormData.gainAmount,
        taxRate: newFormData.taxRate,
        hold10Years: newFormData.hold10Years,
        totalSavings: results.totalSavings
      });
    }
  };

  const handleBack = () => {
    if (showResults) {
      router.push('/#investment-reasons');
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/#investment-reasons');
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setFormData({
      gainAmount: null,
      taxRate: null,
      hold10Years: null
    });
    setShowResults(false);
    setCalculationResults(null);
  };

  const currentStepData = STEPS[currentStep];

  if (showResults && calculationResults) {
    return <ResultsScreen results={calculationResults} onBack={handleBack} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black px-8 pt-32 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tight mb-4">
            OZ Tax Savings Calculator
          </h1>
          <p className="text-xl text-black/60 dark:text-white/60 font-light">
            Calculate your potential federal capital gains tax savings
          </p>
        </div>

        {/* Disclaimer Banner */}
        <div className="mb-8 glass-card rounded-2xl p-4 bg-yellow-50/80 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Demo Only - Not Tax Advice
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                This calculator provides illustrative estimates only. Consult your CPA for personalized tax advice.
              </p>
            </div>
          </div>
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

            {/* Step 1: Gain Amount */}
            {currentStep === 0 && (
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

            {/* Step 2: Tax Bracket */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {TAX_BRACKET_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleStepComplete('taxRate', option.value)}
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

            {/* Step 3: Hold Period */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {HOLD_PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleStepComplete('hold10Years', option.value)}
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
          
          <div className="text-sm text-black/40 dark:text-white/40">
            Updated: {TAX_CALC_CONFIG.LAST_UPDATED} • {TAX_CALC_CONFIG.BILL_VERSION}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ results, onBack, onReset }) {
  const confettiTrigger = () => {
    // Simple confetti effect - could be enhanced with a library
    console.log('🎉 Confetti!');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black px-8 pt-32 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={confettiTrigger}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#30d158] to-[#40e168] rounded-full mb-6"
          >
            <Calculator className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tight mb-4">
            Your Tax Savings Estimate
          </h1>
          <p className="text-xl text-black/60 dark:text-white/60 font-light">
            Based on your Opportunity Zone investment strategy
          </p>
        </div>

        {/* Hero Number */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-[#30d158]/5 to-[#40e168]/5 border-2 border-[#30d158]/20">
            <p className="text-lg text-black/60 dark:text-white/60 mb-2">
              You could defer/avoid approximately
            </p>
            <p className="text-5xl md:text-6xl font-bold text-[#30d158] mb-4">
              {formatCurrency(results.totalSavings)}
            </p>
            <p className="text-lg text-black/60 dark:text-white/60">
              in federal capital gains tax
            </p>
          </div>
        </motion.div>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Immediate Deferral */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-2xl p-6 bg-gradient-to-br from-[#ff6b35]/5 to-[#ff8c42]/5 border border-[#ff6b35]/20"
          >
            <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
              Immediate Federal Deferral
            </h3>
            <p className="text-3xl font-bold text-[#ff6b35] mb-3">
              {formatCurrency(results.immediateDeferral)}
            </p>
            <p className="text-sm text-black/60 dark:text-white/60">
              Put off paying until {TAX_CALC_CONFIG.DEFERRAL_DEADLINE}
            </p>
          </motion.div>

          {/* 10-Year Exemption */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-card rounded-2xl p-6 bg-gradient-to-br from-[#6b8dd6]/5 to-[#8fa7db]/5 border border-[#6b8dd6]/20"
          >
            <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
              10-Year Full Capital Gains Exemption
            </h3>
            <p className="text-3xl font-bold text-[#6b8dd6] mb-3">
              {formatCurrency(results.tenYearExemption)}
            </p>
            <p className="text-sm text-black/60 dark:text-white/60">
              {results.hold10Years 
                ? `Pay $0 on future appreciation worth ≈ ${formatCurrency(results.forecastAppreciation)}`
                : 'Not applicable (under 10-year hold)'
              }
            </p>
          </motion.div>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="glass-card rounded-2xl p-6 bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10 mb-6"
        >
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            Calculation Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-black/60 dark:text-white/60">Federal Capital Gain Amount:</span>
              <span className="text-black dark:text-white font-medium">{getGainAmountLabel(results.gainAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60 dark:text-white/60">Federal Tax Rate:</span>
              <span className="text-black dark:text-white font-medium">{getTaxBracketLabel(results.taxRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60 dark:text-white/60">Hold Period:</span>
              <span className="text-black dark:text-white font-medium">
                {results.hold10Years ? '10+ years' : 'Under 10 years'}
              </span>
            </div>
            <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-3">
              <span className="text-black/60 dark:text-white/60">Federal Tax Due Now (without OZ):</span>
              <span className="text-black dark:text-white font-medium">{formatCurrency(results.taxDueNow)}</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col items-center w-full">
            <ScheduleCallCTA />
            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 w-full">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
                <button
                    onClick={onReset}
                    className="px-6 py-3 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                >
                    Start Over
                </button>
            </div>
        </div>

        {/* Disclaimers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8 text-center text-xs text-black/40 dark:text-white/40 space-y-2"
        >
          <p>
            Last updated: {TAX_CALC_CONFIG.LAST_UPDATED} • {TAX_CALC_CONFIG.BILL_VERSION}
          </p>
          <p>
            This calculation is illustrative only and does not constitute tax advice. 
            <br />
            <a href="https://www.irs.gov/credits-deductions/opportunity-zones-frequently-asked-questions" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-[#0071e3] hover:underline">
              View IRS FAQ
            </a>
            {' • '}
            <a href="#" className="text-[#0071e3] hover:underline">
              Legislative Text PDF
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
} 