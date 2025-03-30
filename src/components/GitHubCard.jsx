import React from 'react';
import { GitPullRequest, GitCommit, Building2, Star, GitFork } from 'lucide-react';

const GitHubCard = ({ username, prStats, commitStats, orgStats, topRepos }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-xl max-w-2xl mx-auto">
      <div className="border-b border-gray-700 pb-4 mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <img 
            src={`https://github.com/${username}.png`} 
            alt={username}
            className="w-8 h-8 rounded-full"
          />
          {username}'s GitHub Activity
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
  );
};

export default GitHubCard; 