import React, { useRef } from 'react';
import { GitPullRequest, GitCommit, Building2, Star, GitFork, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const getGitHubAvatarUrl = (username) => {
  // Using githubusercontent directly to avoid CORS issues
  return `https://avatars.githubusercontent.com/${username}`;
};

const GitHubCard = ({ username, prStats, commitStats, orgStats, topRepos }) => {
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

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Download button above the card */}
      <button
        onClick={downloadCard}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        title="Download as PNG"
      >
        <Download size={20} />
        Download Stats Card
      </button>

      {/* Card Container with padding for shadow */}
      <div 
        ref={cardRef}
        className="p-4" // Padding to ensure shadow is captured
      >
        {/* Actual Card Content */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-xl w-full max-w-2xl">
          <div className="border-b border-gray-700 pb-4 mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <img 
                src={getGitHubAvatarUrl(username)} 
                alt={username}
                className="w-8 h-8 rounded-full"
                crossOrigin="anonymous"
              />
              {username}'s GitHub Activity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <GitPullRequest size={20} />
                Pull Requests
              </div>
              <div className="text-2xl font-bold">{prStats.totalPRs}</div>
              <div className="text-sm text-gray-400">
                {prStats.mergedPRs} merged • {prStats.openPRs} open
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <GitCommit size={20} />
                Commits
              </div>
              <div className="text-2xl font-bold">{commitStats.total}+</div>
              <div className="text-sm text-gray-400">
                In top repositories
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Building2 size={20} />
                Open Source
              </div>
              <div className="text-2xl font-bold">{orgStats.totalPRs} PR's</div>
              <div className="text-sm text-gray-400">
                Across {orgStats.count} orgs
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-3">Top Repositories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topRepos.slice(0, 2).map(repo => (
                <div key={repo.name} className="bg-gray-700/50 p-3 rounded">
                  <div className="font-medium text-blue-400">{repo.name.split('/')[1]}</div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Star size={12} />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={12} />
                      {repo.forks}
                    </span>
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        {repo.language}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-sm text-gray-400">
            Generated on {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubCard; 