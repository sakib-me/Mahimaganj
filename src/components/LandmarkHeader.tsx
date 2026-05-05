import { motion } from 'motion/react';

export default function LandmarkHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#15803d] text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg
            viewBox="0 0 200 60"
            className="h-12 w-auto fill-white/90"
            aria-label="Mahimaganj Landmarks"
          >
            {/* Sugar Mill Silhouette */}
            <g transform="translate(10, 10)">
              <rect x="0" y="10" width="8" height="35" />
              <motion.path
                d="M 4 8 C 4 0, 12 5, 20 0"
                stroke="white"
                strokeWidth="1"
                fill="none"
                animate={{ opacity: [0.3, 0.7, 0.3], x: [0, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </g>

            {/* Railway Station Silhouette */}
            <g transform="translate(45, 15)">
              <path d="M 0 30 L 0 10 Q 20 0 40 10 L 40 30 Z" />
              <rect x="15" y="15" width="10" height="15" /> {/* Arch door */}
            </g>

            {/* Madrasah Silhouette */}
            <g transform="translate(110, 10)">
              {/* Minaret */}
              <rect x="0" y="5" width="6" height="40" />
              <path d="M -2 5 L 8 5 L 3 0 Z" />
              
              {/* Dome */}
              <path d="M 15 45 L 15 20 Q 30 5 45 20 L 45 45 Z" />
              <path d="M 30 5 L 30 0" stroke="white" strokeWidth="1" />
            </g>
          </svg>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">মহিমাগঞ্জ</h1>
            <span className="text-[10px] uppercase font-medium opacity-80">Community Hub</span>
          </div>
        </div>
      </div>
    </header>
  );
}
