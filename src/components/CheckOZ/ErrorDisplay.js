'use client';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="glass-card rounded-3xl p-6 mb-8 bg-[#ff375f]/5 border border-[#ff375f]/20 animate-fadeIn">
      <div className="flex items-start">
        <div className="text-[#ff375f] mt-1 mr-4">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-[#ff375f] font-medium">
          {error.split('\n').map((line, index) => (
            <div key={index} className={index > 0 ? 'mt-2' : ''}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 