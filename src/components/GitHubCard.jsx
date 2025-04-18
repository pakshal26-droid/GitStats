"use client"

import { useRef, useState, useEffect } from "react"
import { GitPullRequest, GitCommit, BookOpen, Github, Star, Code, Download, Copy, Share2 } from "lucide-react"
import * as htmlToImage from "html-to-image"
import { db } from "../firebase"
import { collection, addDoc } from "firebase/firestore"

const getGitHubAvatarUrl = (username) => {
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
        backgroundColor: "#111827",
        style: {
          width: "100%", // Ensure full width capture
          height: `${cardRef.current.offsetHeight}px`, // Capture full height dynamically
          boxShadow: "none",
          margin: "0",
          padding: "0",
        },
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
      const statsData = {
        username,
        prStats,
        commitStats,
        orgStats,
        topRepos,
        generatedAt: new Date().toISOString(),
      }

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

  const prPercentage = Math.min(100, (prStats.totalPRs / 10) * 100)
  const commitPercentage = Math.min(100, (Number.parseInt(commitStats.total) / 100) * 100)
  const osPercentage = Math.min(100, (orgStats.totalPRs / 10) * 100)

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4 sm:px-0">
      <div className="flex flex-row gap-2 w-full sm:w-auto overflow-x-auto pb-2">
        <button
          onClick={downloadCard}
          className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 justify-center text-sm sm:text-base"
          title="Download as PNG"
        >
          <Download size={16} className="sm:w-5" />
          <span className="whitespace-nowrap">Download Card</span>
        </button>
        <button
          onClick={handleShare}
          className="bg-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 justify-center text-sm sm:text-base"
        >
          <Share2 size={16} className="sm:w-5" />
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

      <div
        ref={cardRef}
        className={`w-full max-w-[95vw] mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 sm:p-8 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.15)] border border-indigo-900/30">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle absolute w-1 h-1 rounded-full bg-indigo-500/30 transition-all duration-3000 ease-in-out"
              />
            ))}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0,rgba(99,102,241,0)_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative flex items-center justify-between mb-6 sm:mb-10">
            <div className="flex items-center">
              <div className="relative mr-3 sm:mr-4 bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 rounded-full">
                <div className="absolute inset-0 animate-spin-slow bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full blur opacity-70" />
                <img
                  src={getGitHubAvatarUrl(username) || "/placeholder.svg"}
                  alt={username}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-black"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder.svg?height=64&width=64"
                  }}
                />
              </div>
              <div>
                <h2 className="text-white text-xl sm:text-3xl font-bold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    {username}
                  </span>
                </h2>
                <p className="text-gray-400 text-sm flex items-center">
                  <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> GitHub Developer
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
            <div className=" relative  sm:absolute -top-4 sm:-top-9 left-1/2 transform -translate-x-1/2 text-center px-3  py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xs sm:text-sm text-white font-medium shadow-lg shadow-indigo-900/30">
              GITHUB ACHIEVEMENTS
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 relative z-10">
              <div
                className={`relative group p-4 sm:p-6 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                  hoverState === "pr"
                    ? "bg-gradient-to-br from-purple-900/40 to-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-500/20 scale-105 z-20"
                    : "bg-gray-900/30 border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10"
                }`}
                onMouseEnter={() => setHoverState("pr")}
                onMouseLeave={() => setHoverState(null)}
              >
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/20 rotate-45 transform origin-bottom-left"></div>
                </div>

                <div className="flex items-center mb-2 sm:mb-4">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 mr-2 sm:mr-3">
                    <GitPullRequest className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                  <span className="text-sm sm:text-xl font-medium sm:visible invisible text-purple-300">Pull Requests</span>
                </div>

                <div className="text-white text-2xl sm:text-5xl font-bold mb-2 sm:mb-3 flex items-end">
                  {prStats.totalPRs}
                  <span className="text-purple-400 text-sm  sm:text-lg ml-1 sm:ml-2 mb-0.5 sm:mb-1">total</span>
                </div>

                <div className="mb-2 sm:mb-4 text-gray-400 text-xs sm:text-sm">
                  {prStats.mergedPRs} merged • {prStats.openPRs} open
                </div>

                <div className="h-1.5 sm:h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-300 transition-all duration-1000 ease-out"
                    style={{ width: `${isVisible ? prPercentage : 0}%` }}
                  />
                </div>

                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  PR
                </div>
              </div>

              <div
                className={`relative group p-4 sm:p-6 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                  hoverState === "commit"
                    ? "bg-gradient-to-br from-blue-900/40 to-blue-950/40 border-blue-500/50 shadow-lg shadow-blue-500/20 scale-105 z-20"
                    : "bg-gray-900/30 border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10"
                }`}
                onMouseEnter={() => setHoverState("commit")}
                onMouseLeave={() => setHoverState(null)}
              >
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/20 rotate-45 transform origin-bottom-left"></div>
                </div>

                <div className="flex items-center mb-2 sm:mb-4">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 mr-2 sm:mr-3">
                    <GitCommit className="w-5 h-5 sm:w-6  sm:h-6 text-blue-400" />
                  </div>
                  <span className="text-sm sm:text-xl font-medium sm:visible invisible text-blue-300">Commits</span>
                </div>

                <div className="text-white text-2xl sm:text-5xl font-bold mb-2 sm:mb-3 flex items-end">
                  {commitStats.total}+
                  <span className="text-blue-400 text-sm sm:text-lg ml-1 sm:ml-2 sm:visible invisible mb-0.5 sm:mb-1">commits</span>
                </div>

                <div className="mb-2 sm:mb-4 text-gray-400 text-xs sm:text-sm">In top repositories</div>

                <div className="h-1.5 sm:h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-1000 ease-out"
                    style={{ width: `${isVisible ? commitPercentage : 0}%` }}
                  />
                </div>

                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  CM
                </div>
              </div>

              <div
                className={`relative group p-4 sm:p-6 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                  hoverState === "os"
                    ? "bg-gradient-to-br from-cyan-900/40 to-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/20 scale-105 z-20"
                    : "bg-gray-900/30 border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/10"
                }`}
                onMouseEnter={() => setHoverState("os")}
                onMouseLeave={() => setHoverState(null)}
              >
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 rotate-45 transform origin-bottom-left"></div>
                </div>

                <div className="flex items-center mb-2 sm:mb-4">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/10 mr-2 sm:mr-3">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  </div>
                  <span className="text-sm sm:text-xl sm:visible invisible font-medium text-cyan-300">Open Source</span>
                </div>

                <div className="text-white text-2xl sm:text-5xl font-bold mb-2 sm:mb-3 flex items-end">
                  {orgStats.totalPRs}
                  <span className="text-cyan-400 text-sm sm:text-lg ml-1 sm:ml-2 mb-0.5 sm:mb-1">PR's</span>
                </div>

                <div className="mb-2 sm:mb-4 text-gray-400 text-xs sm:text-sm">
                  Across {orgStats.count} orgs
                </div>

                <div className="h-1.5 sm:h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-1000 ease-out"
                    style={{ width: `${isVisible ? osPercentage : 0}%` }}
                  />
                </div>

                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  OS
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-10 flex justify-between items-center relative z-10">
            <div className="text-gray-500 text-xs sm:text-sm flex items-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mr-1.5 sm:mr-2 animate-pulse"></div>
              Generated on {currentDate}
            </div>

            <div className="flex items-center">
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 bg-gray-800/50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-gray-700/50 hover:border-indigo-500/50"
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

export default GitHubCard




