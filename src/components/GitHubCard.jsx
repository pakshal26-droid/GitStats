"use client"

import { useRef, useState, useEffect } from "react"
import { GitPullRequest, GitCommit, BookOpen, Github, Star, Code, Download, Copy, Share2 } from "lucide-react"
import * as htmlToImage from "html-to-image"
import { db } from "../firebase"
import { collection, addDoc } from "firebase/firestore"

const getGitHubAvatarUrl = (username) => {
  // Using githubusercontent directly to avoid CORS issues
  return `https://avatars.githubusercontent.com/${username}`
}

const GitHubCard = ({
  username,
  prStats = { totalPRs: 0, mergedPRs: 0, openPRs: 0 },
  commitStats = { total: "0" },
  orgStats = { totalPRs: 0, count: 0 },
  topRepos = [],
}) => {
  const [shareUrl, setShareUrl] = useState("")
  const [showShareLink, setShowShareLink] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hoverState, setHoverState] = useState(null)
  const cardRef = useRef(null)

  useEffect(() => {
    setIsVisible(true)

    // Add particle animation
    const particleAnimation = () => {
      const particles = document.querySelectorAll(".particle")
      particles.forEach((particle) => {
        const element = particle
        element.style.top = `${Math.random() * 100}%`
        element.style.left = `${Math.random() * 100}%`
        element.style.opacity = `${Math.random() * 0.5 + 0.2}`
        element.style.transform = `scale(${Math.random() * 0.5 + 0.5})`
      })
    }

    const interval = setInterval(particleAnimation, 3000)
    particleAnimation()

    return () => clearInterval(interval)
  }, [])

  const downloadCard = async () => {
    if (cardRef.current === null) return

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#111827'
      })

      const link = document.createElement("a")
      link.download = `${username}-github-stats.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error generating image:", error)
    }
  }

  const handleShare = async () => {
    try {
      // Prepare data to save
      const statsData = {
        username,
        prStats,
        commitStats,
        orgStats,
        topRepos,
        generatedAt: new Date().toISOString(),
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, "stats"), statsData)
      const generatedUrl = `${window.location.origin}/share/${docRef.id}`

      setShareUrl(generatedUrl)
      setShowShareLink(true)
    } catch (error) {
      console.error("Error sharing stats:", error)
      alert("Error generating share link")
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert("Link copied to clipboard!")
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })

  // Calculate percentage for progress bars
  const prPercentage = Math.min(100, (prStats.totalPRs / 10) * 100)
  const commitPercentage = Math.min(100, (Number.parseInt(commitStats.total) / 100) * 100)
  const osPercentage = Math.min(100, (orgStats.totalPRs / 10) * 100)

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4 sm:px-0">
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          onClick={downloadCard}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 justify-center"
          title="Download as PNG"
        >
          <Download size={20} />
          <span className="whitespace-nowrap">Download Stats Card</span>
        </button>
        <button
          onClick={handleShare}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 justify-center"
        >
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>

      {showShareLink && (
        <div className="w-full max-w-2xl bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg mt-4 animate-fade-in border border-indigo-500/20">
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-md flex items-center gap-2 transition-colors"
              title="Copy link"
            >
              <Copy size={16} />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">Link generated! Share this URL with anyone</p>
          <button onClick={() => setShowShareLink(false)} className="text-red-400 hover:text-red-300 text-sm mt-2">
            Close
          </button>
        </div>
      )}

      {/* Card Container */}
      <div
        ref={cardRef}
        className={`w-full max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-black p-8 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.15)] border border-indigo-900/30">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated particles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle absolute w-1 h-1 rounded-full bg-indigo-500/30 transition-all duration-3000 ease-in-out"
              />
            ))}

            {/* Decorative grid lines */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0,rgba(99,102,241,0)_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Glow effects */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
          </div>

          {/* Header with GitHub logo */}
          <div className="relative flex items-center justify-between mb-10">
            <div className="flex items-center">
              <div className="relative mr-4 bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 rounded-full">
                <div className="absolute inset-0 animate-spin-slow bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full blur opacity-70" />
                <img
                  src={getGitHubAvatarUrl(username) || "/placeholder.svg"}
                  alt={username}
                  className="w-16 h-16 rounded-full border-2 border-black"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder.svg?height=64&width=64"
                  }}
                />
              </div>
              <div>
                <h2 className="text-white text-3xl font-bold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    {username}
                  </span>
                </h2>
                <p className="text-gray-400 flex items-center">
                  <Github className="w-4 h-4 mr-1" /> GitHub Developer
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700/50 text-xs text-gray-400 flex items-center">
                <Code className="w-3 h-3 mr-1" /> Developer
              </div>
              <div className="px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700/50 text-xs text-gray-400 flex items-center">
                <Star className="w-3 h-3 mr-1 text-yellow-500" /> Coder
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Decorative title */}
            <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white text-xs font-medium shadow-lg shadow-indigo-900/30">
              GITHUB ACHIEVEMENTS
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Pull Requests */}
              <div
                className={`relative group p-6 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                  hoverState === "pr"
                    ? "bg-gradient-to-br from-purple-900/40 to-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-500/20 scale-105 z-20"
                    : "bg-gray-900/30 border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10"
                }`}
                onMouseEnter={() => setHoverState("pr")}
                onMouseLeave={() => setHoverState(null)}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/20 rotate-45 transform origin-bottom-left"></div>
                </div>

                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/10 mr-3">
                    <GitPullRequest className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-xl font-medium text-purple-300">Pull Requests</span>
                </div>

                <div className="text-white text-5xl font-bold mb-3 flex items-end">
                  {prStats.totalPRs}
                  <span className="text-purple-400 text-lg ml-2 mb-1">total</span>
                </div>

                <div className="mb-4 text-gray-400 text-sm">
                  {prStats.mergedPRs} merged • {prStats.openPRs} open
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-300 transition-all duration-1000 ease-out"
                    style={{ width: `${isVisible ? prPercentage : 0}%` }}
                  />
                </div>

                {/* Decorative badge */}
                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  PR
                </div>
              </div>

              {/* Commits */}
              <div
                className={`relative group p-6 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                  hoverState === "commit"
                    ? "bg-gradient-to-br from-blue-900/40 to-blue-950/40 border-blue-500/50 shadow-lg shadow-blue-500/20 scale-105 z-20"
                    : "bg-gray-900/30 border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10"
                }`}
                onMouseEnter={() => setHoverState("commit")}
                onMouseLeave={() => setHoverState(null)}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/20 rotate-45 transform origin-bottom-left"></div>
                </div>

                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 mr-3">
                    <GitCommit className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xl font-medium text-blue-300">Commits</span>
                </div>

                <div className="text-white text-5xl font-bold mb-3 flex items-end">
                  {commitStats.total}+<span className="text-blue-400 text-lg ml-2 mb-1">commits</span>
                </div>

                <div className="mb-4 text-gray-400 text-sm">In top repositories</div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-1000 ease-out"
                    style={{ width: `${isVisible ? commitPercentage : 0}%` }}
                  />
                </div>

                {/* Decorative badge */}
                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  CM
                </div>
              </div>

              {/* Open Source */}
              <div
                className={`relative group p-6 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                  hoverState === "os"
                    ? "bg-gradient-to-br from-cyan-900/40 to-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/20 scale-105 z-20"
                    : "bg-gray-900/30 border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/10"
                }`}
                onMouseEnter={() => setHoverState("os")}
                onMouseLeave={() => setHoverState(null)}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 rotate-45 transform origin-bottom-left"></div>
                </div>

                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-cyan-500/10 mr-3">
                    <BookOpen className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-xl font-medium text-cyan-300">Open Source</span>
                </div>

                <div className="text-white text-5xl font-bold mb-3 flex items-end">
                  {orgStats.totalPRs}
                  <span className="text-cyan-400 text-lg ml-2 mb-1">PR's</span>
                </div>

                <div className="mb-4 text-gray-400 text-sm">Across {orgStats.count} orgs</div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-1000 ease-out"
                    style={{ width: `${isVisible ? osPercentage : 0}%` }}
                  />
                </div>

                {/* Decorative badge */}
                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  OS
                </div>
              </div>
            </div>
          </div>

          {/* Footer with decorative elements */}
          <div className="mt-10 flex justify-between items-center relative z-10">
            <div className="text-gray-500 text-sm flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              Generated on {currentDate}
            </div>

            <div className="flex items-center">
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50 hover:border-indigo-500/50"
              >
                <Github className="w-3 h-3" />
                View Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GitHubCard;

