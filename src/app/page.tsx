import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400">
      {/* Content */}
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="max-w-2xl w-full text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Construction Audit Platform
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-indigo-100">
            Standardized audits. Clean data. Building quality.
          </p>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {/* Auditor Card */}
            <Link
              href="/auditor"
              className="group block bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-md rounded-xl p-8 transition-all transform hover:scale-105 border border-white border-opacity-30"
            >
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold mb-3">Auditor</h2>
              <p className="text-indigo-100 mb-6">
                Perform field audits, collect defects, upload photos
              </p>
              <div className="inline-block px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold group-hover:shadow-lg transition-shadow">
                Start Auditing →
              </div>
            </Link>

            {/* Builder Card */}
            <Link
              href="/builder"
              className="group block bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-md rounded-xl p-8 transition-all transform hover:scale-105 border border-white border-opacity-30"
            >
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-3">Builder</h2>
              <p className="text-indigo-100 mb-6">
                View results, track quality, analyze trends
              </p>
              <div className="inline-block px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold group-hover:shadow-lg transition-shadow">
                View Dashboard →
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 pt-12 border-t border-white border-opacity-30">
            <h3 className="text-lg font-semibold mb-6 text-indigo-100">
              Platform Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Mobile-First Audits</h4>
                  <p className="text-sm text-indigo-100">
                    Optimized for field auditors
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Immutable Records</h4>
                  <p className="text-sm text-indigo-100">
                    Complete audit history preserved
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Evidence Tracking</h4>
                  <p className="text-sm text-indigo-100">
                    Photos and notes on failures
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
