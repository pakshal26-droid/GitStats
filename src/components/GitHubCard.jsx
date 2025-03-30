import React, { useRef , useState } from 'react';
import { GitPullRequest, GitCommit, Building2, Star, GitFork, Download , Copy  } from 'lucide-react';
import { Share2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import {db} from "../firebase"
import { collection, addDoc } from 'firebase/firestore';

const getGitHubAvatarUrl = (username) => {
  // Using githubusercontent directly to avoid CORS issues
  return `https://avatars.githubusercontent.com/${username}`;
};

const GitHubCard = ({ username, prStats, commitStats, orgStats, topRepos }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [showShareLink, setShowShareLink] = useState(false);
  const cardRef = useRef(null);

  const downloadCard = async () => {
    if (cardRef.current === null) return;

    try {
      // Add padding to ensure shadows are captured
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#111827',
        style: {
          padding: '20px' // Add padding to capture shadow
        }
      });
      
      const link = document.createElement('a');
      link.download = `${username}-github-stats.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const handleShare = async () => {
    try {
      // Prepare data to save
      const statsData = {
        username,
        prStats,
        commitStats,
        orgStats,
        topRepos,
        generatedAt: new Date().toISOString()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "stats"), statsData);
      const generatedUrl = `${window.location.origin}/share/${docRef.id}`;
      
      setShareUrl(generatedUrl);
      setShowShareLink(true);
    } catch (error) {
      console.error("Error sharing stats:", error);
      alert("Error generating share link");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4 sm:px-0">
      {/* Download button above the card */}
      <button
        onClick={downloadCard}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        title="Download as PNG"
      >
        <Download size={20} />
        <span className="whitespace-nowrap">Download Stats Card</span>
      </button>
      <button
          onClick={handleShare}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 flex-1 justify-center"
        >
          <Share2 size={20} /> {/* Import Share2 from lucide-react */}
          <span>Share</span>
        </button>
        {showShareLink && (
        <div className="w-full max-w-2xl bg-gray-800 p-4 rounded-lg mt-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-gray-700 text-white p-2 rounded-l-md text-sm truncate"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md flex items-center gap-2 transition-colors"
              title="Copy link"
            >
              <Copy size={16} />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Link generated! Share this URL with anyone
          </p>
          <button
            onClick={() => setShowShareLink(false)}
            className="text-red-400 hover:text-red-300 text-sm mt-2"
          >
            Close
          </button>
        </div>
      )}

      {/* Card Container with padding for shadow */}
      <div 
        ref={cardRef}
        className="p-4 w-full max-w-2xl"
      >
        {/* Actual Card Content */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-6 rounded-xl shadow-xl w-full">
          <div className="border-b border-gray-700 pb-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
              <img 
                src={getGitHubAvatarUrl(username)} 
                alt={username}
                className="w-8 h-8 rounded-full"
                crossOrigin="anonymous"
              />
              <span className="break-all">{username}'s GitHub Activity</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <GitPullRequest size={18} />
                <span className="text-sm sm:text-base">Pull Requests</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{prStats.totalPRs}</div>
              <div className="text-xs sm:text-sm text-gray-400">
                {prStats.mergedPRs} merged • {prStats.openPRs} open
              </div>
            </div>

            <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <GitCommit size={18} />
                <span className="text-sm sm:text-base">Commits</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{commitStats.total}+</div>
              <div className="text-xs sm:text-sm text-gray-400">
                In top repositories
              </div>
            </div>

            <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Building2 size={18} />
                <span className="text-sm sm:text-base">Open Source</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{orgStats.totalPRs} PR's</div>
              <div className="text-xs sm:text-sm text-gray-400">
                Across {orgStats.count} orgs
              </div>
            </div>
          </div>

          

          <div className="text-center text-xs sm:text-sm text-gray-400">
            Generated on {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubCard; 