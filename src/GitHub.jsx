import React, { useState, useEffect } from 'react';
import { GitPullRequest, GitCommit, User, BarChart, Search, Loader, Code, Star, GitFork, Building2, ArrowBigDown, ArrowDown, X } from 'lucide-react';
import GitHubCard from './components/GitHubCard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

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
  const [organizations, setOrganizations] = useState([]);
  const [orgPRsMap, setOrgPRsMap] = useState({});
  const [showCard, setShowCard] = useState(false);

  const location = useLocation();
  const isGitHubRoute = location.pathname === '/github';

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

      // Filter PRs matching the current username
      const matching = data.items.filter(pr => pr.user.login === username);

      // Update organizations and their PR data
      if (!organizations.includes(inputOrgName)) {
        setOrganizations([...organizations, inputOrgName]);
        setOrgPRsMap({
          ...orgPRsMap,
          [inputOrgName]: matching
        });
      }

      setInputOrgName(''); // Clear input after successful fetch

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
      .slice(0, 3)
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

  const prepareCardStats = () => {
    const prStats = calculatePRStats();
    const commitStats = {
      total: totalCommits,
      byRepo: getCommitStats()
    };
    const orgStats = {
      totalPRs: Object.values(orgPRsMap).reduce((sum, prs) => sum + prs.length, 0),
      count: organizations.length
    };
    const topRepos = getTopRepos();

    return {
      prStats,
      commitStats,
      orgStats,
      topRepos
    };
  };

  const prStats = calculatePRStats();
  const topRepos = getTopRepos();
  const commitStats = getCommitStats();

  return (
    <>
      {/* Header */}
      <div className='relative w-full px-4 sm:px-8 md:px-16 lg:px-24 z-10 pt-6 md:pt-10 flex items-center justify-between'>
            <Link to="/" className='font-semibold text-xl sm:text-2xl font-anek'>GitDaddy</Link>
            {!isGitHubRoute && <Link to="/github" className='font-semibold bg-black px-3 py-1 sm:px-5 sm:py-1 rounded-full flex items-center gap-x-1 text-white text-base sm:text-lg font-anek'>
              <span className='hidden sm:inline'>Try Out</span>
              <span className='sm:hidden'>Try</span>
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </Link>}
      </div>
      <div className="w-full py-10  max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {/* Header */}

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
                    {loading ? <Loader className="animate-spin" size={16} /> : <Search size={16} />}
                  </button>
                </div>

                {/* Added Organizations */}
                {organizations.length > 0 && (
                  <div className="mt-4">
                    <div className="bg-indigo-50 p-4 rounded-md mb-4">
                      <div className="text-indigo-600 font-medium">Total Organization PRs</div>
                      <div className="text-2xl font-bold">
                        {Object.values(orgPRsMap).reduce((sum, prs) => sum + prs.length, 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Across {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <h3 className="text-sm font-medium text-gray-600 mb-2">Added Organizations:</h3>
                    <ul className="space-y-2">
                      {organizations.map(org => (
                        <li key={org} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{org}</span>
                          <span className="text-indigo-600 font-medium">
                            {orgPRsMap[org]?.length || 0} PRs
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {loading ? null : (
                  <p className="text-sm text-gray-500 mt-4 flex items-center gap-x-1">
                    Check Bottom <ArrowDown className='size-4' />
                  </p>
                )}
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
                      {commitStats.map(({ repoName, count }) => (
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
        {Object.keys(orgPRsMap).length > 0 && (
          <div className="md:col-span-3 h-full">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                  <Building2 className="text-indigo-600" size={20} />
                  Organization PR Results
                </div>
                <div className="text-sm font-normal text-gray-500">
                  {Object.values(orgPRsMap).reduce((sum, prs) => sum + prs.length, 0)} PRs across {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="p-6">
                {organizations.map(org => (
                  <div key={org} className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-3">{org}</h3>
                    <ul className="space-y-2">
                      {orgPRsMap[org].map(pr => (
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
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate Card Button */}
        {username && (
          <div className="md:col-span-3 flex justify-center mt-6">
            <button
              onClick={() => setShowCard(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
            >
              Generate Summary Card
            </button>
          </div>
        )}

        {/* Card Modal */}
        {showCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="relative w-content my-4 sm:my-8">
              <button
                onClick={() => setShowCard(false)}
                className="absolute -top-2 -right-2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 z-20"
              >
                <X size={20} />
              </button>
              <GitHubCard
                username={username}
                {...prepareCardStats()}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GitHub;