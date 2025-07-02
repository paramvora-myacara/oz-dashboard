import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
          Authentication Error
        </h1>
        <p className="text-black/60 dark:text-white/60 mb-6">
          Sorry, there was an error with the authentication process.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#0071e3] text-white rounded-lg hover:bg-[#0077ed] transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
} 