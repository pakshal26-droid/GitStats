import React, { useState, useEffect } from 'react';
import { GitPullRequest, GitCommit, User, BarChart, Search, Loader, Code, Star, GitFork, Building2, ArrowBigDown, ArrowDown } from 'lucide-react';

const GitHub = () => {
  const [username, setUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [prData, setPRData] = useState(null);
  const [reposData, setReposData] = useState([]);
  const [commitsData, setCommitsData] = useState({});
  const [totalCommits, setTotalCommits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputOrgName, setInputOrgName] = useState('');
  const [orgPRData, setOrgPRData] = useState(null);
  const [matchingPRs, setMatchingPRs] = useState([]);

  const fetchUserData = async () => {
    if (!inputUsername.trim()) return;
    
    setLoading(true);
    setError(null);
    setPRData(null);
    setReposData([]);
    setCommitsData({});
    setTotalCommits(0);
    setInputOrgName('');
    setOrgPRData(null);
    setMatchingPRs([]);
    
    try {
      // 1. Fetch PRs
      const prResponse = await fetch(
        `https://api.github.com/search/issues?q=author:${inputUsername}+type:pr&sort=updated&order=desc&per_page=100`
      );
      
      if (!prResponse.ok) {
        throw new Error(`Failed to fetch PR data: ${prResponse.status}`);
      }
      
      const prData = await prResponse.json();
      setPRData(prData);
      
      // 2. Fetch Repositories
      const reposResponse = await fetch(
        `https://api.github.com/users/${inputUsername}/repos?per_page=100`
      );
      
      if (!reposResponse.ok) {
        throw new Error(`Failed to fetch repositories: ${reposResponse.status}`);
      }
      
      const reposData = await reposResponse.json();
      setReposData(reposData);
      
      // 3. Fetch Commits for each repository (limited to top 5 repos by recent activity)
      const sortedRepos = [...reposData].sort((a, b) => 
        new Date(b.pushed_at) - new Date(a.pushed_at)
      ).slice(0, 5);
      
      let commitsMap = {};
      let commitCount = 0;
      
      for (const repo of sortedRepos) {
        try {
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${inputUsername}/${repo.name}/commits?author=${inputUsername}&per_page=100`
          );
          
          if (commitsResponse.ok) {
            const commits = await commitsResponse.json();
            commitsMap[repo.name] = commits;
            commitCount += commits.length;
          }
        } catch (err) {
          console.error(`Error fetching commits for ${repo.name}:`, err);
        }
      }
      
      setCommitsData(commitsMap);
      setTotalCommits(commitCount);
      setUsername(inputUsername);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgPRs = async () => {
    if (!inputOrgName.trim() || !username.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.github.com/search/issues?q=org:${inputOrgName}+type:pr&sort=asc&per_page=100`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch organization data: ${response.status}`);
      }
      
      const data = await response.json();
      setOrgPRData(data);
      
      // Filter PRs matching the current username
      const matching = data.items.filter(pr => pr.user.login === username);
      setMatchingPRs(matching);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePRStats = () => {
    if (!prData || !prData.items || prData.items.length === 0) {
      return { 
        totalPRs: 0,
        openPRs: 0,
        closedPRs: 0,
        mergedPRs: 0,
        repoMap: {}
      };
    }

    const stats = {
      totalPRs: prData.total_count,
      openPRs: 0,
      closedPRs: 0,
      mergedPRs: 0,
      repoMap: {}
    };

    prData.items.forEach(pr => {
      if (pr.state === 'open') {
        stats.openPRs++;
      } else {
        stats.closedPRs++;
        if (pr.pull_request && pr.pull_request.merged_at) {
          stats.mergedPRs++;
        }
      }

      const repoName = pr.repository_url.split('/repos/')[1];
      if (!stats.repoMap[repoName]) {
        stats.repoMap[repoName] = 1;
      } else {
        stats.repoMap[repoName]++;
      }
    });

    return stats;
  };

  const getTopRepos = () => {
    return reposData
      .slice(0, 5)
      .map(repo => ({
        name: repo.full_name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        description: repo.description,
        url: repo.html_url
      }));
  };

  const getCommitStats = () => {
    return Object.entries(commitsData)
      .map(([repoName, commits]) => ({
        repoName,
        count: commits.length
      }))
      .sort((a, b) => b.count - a.count);
  };

  const prStats = calculatePRStats();
  const topRepos = getTopRepos();
  const commitStats = getCommitStats();

  return (
    <div className="w-full py-10  max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
      {/* User Search Card */}
      <div className={`${username ? 'md:col-span-2' : 'md:col-span-3'} h-full`}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
              <User className="text-blue-600" size={20} />
              GitHub User Dashboard
            </div>
            <div className="text-sm text-gray-500 mt-1">
               View pull requests, commits, and repositories
           </div>
          </div>
          <div className="p-6">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter GitHub username"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={fetchUserData}
                disabled={loading || !inputUsername.trim()}
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  loading || !inputUsername.trim() 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? <Loader className="animate-spin mr-2" size={16} /> : <Search size={16} />}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-3 text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            {username && !error && (
              <div className="flex items-center gap-3 mt-4">
                <User size={20} className="text-gray-600" />
                <span className="font-medium text-lg">{username}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Organization Search Card */}
      {username && !error && (
        <div className="md:col-span-1 h-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                <Building2 className="text-indigo-600" size={20} />
                Organization Search
              </div>
              <div className="text-sm text-gray-500 mt-1">
                View organizations pull requests
              </div>   
            </div>
            <div className="p-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Organization name"
                  value={inputOrgName}
                  onChange={(e) => setInputOrgName(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  onClick={fetchOrgPRs}
                  disabled={!inputOrgName.trim()}
                  className={`px-4 py-2 rounded-md text-white ${
                    !inputOrgName.trim()
                      ? 'bg-indigo-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                    {loading ? <Loader className="animate-spin mr-2" size={16} /> : <Search size={16} />}

                </button>
                
              </div>
                {loading? null : <p className="text-sm text-gray-500 mt-10 flex items-center gap-x-1 ">Check Bottom <ArrowDown className='size-4'/></p> }
            </div>
          </div>
        </div>
      )}

      {/* PR Stats Card */}
      {prData && (
        <div className="md:col-span-2 h-full ">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                <GitPullRequest className="text-purple-600" size={20} />
                Pull Request Activity
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 p-4 rounded-md">
                <div className="text-purple-600 font-medium">Total PRs</div>
                <div className="text-2xl font-bold">{prStats.totalPRs}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md">
                <div className="text-green-600 font-medium">Merged</div>
                <div className="text-2xl font-bold">{prStats.mergedPRs}</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="text-yellow-600 font-medium">Open</div>
                <div className="text-2xl font-bold">{prStats.openPRs}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-gray-600 font-medium">Closed</div>
                <div className="text-2xl font-bold">{prStats.closedPRs}</div>
              </div>
            </div>
            {Object.keys(prStats.repoMap).length > 0 && (
              <div className='px-6'>
                <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <BarChart size={16} />
                  Top Repositories (PRs)
                </h3>
                <ul className="space-y-2">
                  {Object.entries(prStats.repoMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([repo, count]) => (
                      <li key={repo} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span className="truncate max-w-xs">{repo}</span>
                         <span className="font-medium">{count} PRs</span>
                       </li>
                     ))}
                 </ul>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Commit Activity Card */}
      {Object.keys(commitsData).length > 0 && (
        <div className="md:col-span-1 h-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                <GitCommit className="text-blue-600" size={20} />
                Commit Activity
              </div>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <div className="text-blue-600 font-medium">Total Commits</div>
                <div className="text-2xl font-bold">{totalCommits}+</div>
                <div className="text-xs text-gray-500 mt-1">From top 5 recent repositories</div>
              </div>

              {commitStats.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <BarChart size={16} />
                    Commits by Repository
                  </h3>
                  <ul className="space-y-2">
                    {commitStats.map(({repoName, count}) => (
                      <li key={repoName} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span className="truncate max-w-xs">{repoName}</span>
                        <span className="font-medium">{count} commits</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Repositories Card */}
      {reposData.length > 0 && (
        <div className="md:col-span-3 h-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                <Code className="text-green-600" size={20} />
                Top Repositories
              </div>
            </div>
            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRepos.map((repo) => (
                <div key={repo.name} className="border border-gray-100 rounded-md p-4 hover:bg-gray-50">
                  <div className="font-medium text-blue-600">
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {repo.name}
                    </a>
                  </div>
                  {repo.description && (
                    <div className="text-sm text-gray-600 my-1 line-clamp-2">{repo.description}</div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star size={12} />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={12} />
                      {repo.forks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Organization PR Results */}
      {matchingPRs.length > 0 && (
        <div className="md:col-span-3 h-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                <Building2 className="text-indigo-600" size={20} />
                Organization PR Results
              </div>
              <div className="text-sm font-normal text-gray-500">
                {matchingPRs.length} matching PRs in {inputOrgName}
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {matchingPRs.map(pr => (
                  <li key={pr.id} className="bg-gray-50 p-3 rounded-md">
                    <a 
                      href={pr.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {pr.title}
                    </a>
                    <div className="text-sm text-gray-500 mt-1">
                      {pr.repository_url.split('/repos/')[1]} • PR #{pr.number}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(pr.created_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHub;