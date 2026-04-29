"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, TrendingUp, BookOpen, Flame, BarChart2, Star as StarIcon, 
  MapPin, Calendar, CheckCircle2, ChevronRight, X, Brain, Share2
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Styles & Keyframes defined via style tag for strict adherence
// ─────────────────────────────────────────────────────────────────────────────
const styles = `
  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes slideInUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes badgeUnlock {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes progressFill {
    0% { width: 0%; }
    100% { width: var(--progress-width); }
  }
  @keyframes pulseSubtle {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .sp-container {
    --bg-dark: #0e0c0a;
    --bg-card: #1d1a17;
    --border-color: #2a2520;
    --gold-primary: #e8b84b;
    --gold-secondary: #d4af37;
    --green-primary: #1d9e75;
    --text-primary: #ffffff;
    --text-secondary: #b8b1a6;
    
    font-family: inherit;
  }

  .sp-section {
    animation: slideInUp 0.6s ease-out forwards;
    background: linear-gradient(135deg, #0e0c0a 0%, #1a1713 100%);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
  }

  .sp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .sp-badges-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sp-badge-card {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
    position: relative;
    animation: popIn 0.4s ease-out forwards;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
  }
  
  .sp-badge-card:hover {
    transform: scale(1.15) translateY(-2px);
    border-color: var(--gold-primary);
    background: rgba(232, 184, 75, 0.15);
    box-shadow: 0 10px 20px rgba(0,0,0,0.4), 0 0 15px rgba(232, 184, 75, 0.2);
    z-index: 10;
  }

  .sp-badge-icon-container {
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }

  .sp-show-more-btn {
    width: 100%;
    margin-top: 20px;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: rgba(232, 184, 75, 0.05);
    color: var(--gold-primary);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .sp-show-more-btn:hover {
    background: rgba(232, 184, 75, 0.1);
    border-color: var(--gold-primary);
  }

  .sp-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .sp-stat-card {
    background: linear-gradient(135deg, #252220 0%, #1d1a17 100%);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    gap: 16px;
    align-items: center;
    transition: all 0.3s ease;
  }
  
  .sp-stat-card:hover {
    transform: translateY(-4px);
    border-color: var(--gold-primary);
  }

  .sp-course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }

  .sp-course-card {
    background: linear-gradient(135deg, #252220 0%, #1d1a17 100%);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .sp-course-card:hover {
    transform: translateY(-8px);
    border-color: var(--gold-primary);
    box-shadow: 0 12px 32px rgba(232, 184, 75, 0.1);
    background: linear-gradient(135deg, #2a2520 0%, #252220 100%);
  }

  .sp-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #1d9e75 0%, #e8b84b 100%);
    border-radius: 4px;
    animation: progressFill 1.5s ease-out forwards;
  }

  .sp-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 32px;
  }

  @media (max-width: 1199px) {
    .sp-badges-grid { gap: 8px; }
  }

  @media (max-width: 767px) {
    .sp-course-grid { grid-template-columns: 1fr; }
    .sp-section { padding: 16px; }
  }

  @media (max-width: 480px) {
    .sp-badges-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (prefers-reduced-motion: reduce) {
    .sp-badge-card, .sp-section, .sp-progress-fill {
      animation: none !important;
      transition: none !important;
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────
function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0;
  const days = [...new Set(sessions.filter(s => s.status === "completed").map(s => new Date(s.created_at).toDateString()))];
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 300; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.includes(d.toDateString())) count++;
    else if (i > 0) break;
  }
  return count;
}

function computeStats(skills, sessions, assessments) {
  const completedCourses = Array.from(new Set(sessions.filter(s => s.status === 'completed').map(s => s.course_id || s.course?.id))).length || 0;
  const enrolledCourses = skills?.filter(s => s.type === 'learn').length || 0;
  const courseCompletionTime = 30; // Mocked
  
  const levels = skills?.map(s => s.proficiency_level) || [];
  const hasAdvanced = levels.includes('Advanced');
  const interPlusCount = levels.filter(l => l === 'Intermediate' || l === 'Advanced').length;
  
  const assessmentsCompleted = assessments?.length || 0;
  const scores = assessments?.map(a => a.score) || [];
  const maxAssessmentScore = scores.length ? Math.max(...scores) : 0;
  const averageAssessmentScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
  
  let consecutiveHighScores = 0;
  let currentHigh = 0;
  [...scores].reverse().forEach(score => {
    if (score >= 90) currentHigh++;
    else currentHigh = 0;
    consecutiveHighScores = Math.max(consecutiveHighScores, currentHigh);
  });

  const latestScore = scores.length > 0 ? scores[scores.length - 1] : 0;
  const initialScore = scores.length > 1 ? scores[0] : latestScore;

  const currentStreak = calculateStreak(sessions);
  const totalSessionsCompleted = sessions?.filter(s => s.status === 'completed').length || 0;

  // Mocked Community / Special Data
  const peerReviewsGiven = 0;
  const meaningfulCommentsPosted = 0;
  const referralCount = 0;
  const peersHelpedCount = 0;
  const communityEngagementPoints = 0;
  const mentoringProgramCompleted = false;
  const completedGoals = 1;
  const uniqueCategoriesCompleted = 1;
  const cohortRanking = 15; // Top 15%

  return {
    completedCourses, enrolledCourses, courseCompletionTime, hasAdvanced, interPlusCount,
    assessmentsCompleted, maxAssessmentScore, averageAssessmentScore, consecutiveHighScores,
    latestScore, initialScore, currentStreak, totalSessionsCompleted,
    peerReviewsGiven, meaningfulCommentsPosted, referralCount, peersHelpedCount,
    communityEngagementPoints, mentoringProgramCompleted, completedGoals,
    uniqueCategoriesCompleted, cohortRanking
  };
}

const BADGE_DEFINITIONS = [
  // 📚 LEARNING MILESTONES (Gold)
  { id: 1, name: "First Step", icon: "👣", category: "Learning Milestones", color: "#e8b84b", criteria: "Complete your first course", pts: 100, desc: "You've taken your first step on your learning journey!", check: s => s.completedCourses >= 1 },
  { id: 2, name: "Course Starter", icon: "🎓", category: "Learning Milestones", color: "#e8b84b", criteria: "Enroll in 3 courses", pts: 150, desc: "You've diversified your learning! Enrolling in 3 courses shows commitment.", check: s => s.enrolledCourses >= 3 },
  { id: 3, name: "Course Master", icon: "🎖️", category: "Learning Milestones", color: "#e8b84b", criteria: "Complete 5 courses", pts: 250, desc: "An elite achievement! Completing 5 full courses demonstrates exceptional dedication.", check: s => s.completedCourses >= 5 },
  { id: 4, name: "Speed Learner", icon: "⚡", category: "Learning Milestones", color: "#e8b84b", criteria: "Complete a course in 2 weeks", pts: 200, desc: "Quick and efficient! You completed a full course in just 2 weeks.", check: s => s.courseCompletionTime <= 14 && s.completedCourses > 0 },
  { id: 5, name: "Specialist", icon: "🔬", category: "Learning Milestones", color: "#e8b84b", criteria: "Reach Advanced proficiency in one skill", pts: 300, desc: "You've become an expert! Reaching Advanced level in any skill is a significant achievement.", check: s => s.hasAdvanced },
  { id: 6, name: "Polymath", icon: "🌟", category: "Learning Milestones", color: "#e8b84b", criteria: "Reach Intermediate+ in 5 different skills", pts: 400, desc: "Renaissance learner! Achieving Intermediate+ in 5 diverse skills.", check: s => s.interPlusCount >= 5 },
  
  // ✨ ASSESSMENT EXCELLENCE (Amber)
  { id: 7, name: "Quiz Taker", icon: "❓", category: "Assessment Excellence", color: "#f59e0b", criteria: "Complete 5 assessments", pts: 100, desc: "You're committed to testing your knowledge!", check: s => s.assessmentsCompleted >= 5 },
  { id: 8, name: "Perfect Score", icon: "💯", category: "Assessment Excellence", color: "#f59e0b", criteria: "Score 100% on any assessment", pts: 300, desc: "Flawless! Achieving perfect marks on an assessment is a rare feat.", check: s => s.maxAssessmentScore === 100 },
  { id: 9, name: "Hot Streak", icon: "🔥", category: "Assessment Excellence", color: "#f59e0b", criteria: "Score 90%+ on 3 consecutive assessments", pts: 250, desc: "Consistently brilliant! Three assessments at 90%+ shows sustained mastery.", check: s => s.consecutiveHighScores >= 3 },
  { id: 10, name: "Improver", icon: "📈", category: "Assessment Excellence", color: "#f59e0b", criteria: "Increase score by 20+ points", pts: 200, desc: "Growth mindset champion! A 20+ point improvement shows real progress.", check: s => (s.latestScore - s.initialScore) >= 20 },
  { id: 11, name: "Knowledge Guru", icon: "🧠", category: "Assessment Excellence", color: "#f59e0b", criteria: "Maintain average score above 85%", pts: 350, desc: "Wisdom keeper! An 85%+ average across all assessments.", check: s => s.averageAssessmentScore >= 85 && s.assessmentsCompleted > 0 },
  { id: 12, name: "Certified Scholar", icon: "📜", category: "Assessment Excellence", color: "#f59e0b", criteria: "Pass 10 assessments with 80%+", pts: 400, desc: "Academic excellence! Ten high-scoring assessments prove consistent mastery.", check: s => s.assessmentsCompleted >= 10 && s.averageAssessmentScore >= 80 }, // Approximation

  // 🔥 CONSISTENCY & COMMITMENT (Bronze)
  { id: 13, name: "Dedicated", icon: "📅", category: "Consistency", color: "#d97706", criteria: "Maintain a 7-day learning streak", pts: 150, desc: "Week warrior! You've learned every day for a week straight.", check: s => s.currentStreak >= 7 },
  { id: 14, name: "On Fire", icon: "🔥", category: "Consistency", color: "#d97706", criteria: "Maintain a 14-day learning streak", pts: 250, desc: "Two weeks of relentless learning!", check: s => s.currentStreak >= 14 },
  { id: 15, name: "Unstoppable", icon: "💪", category: "Consistency", color: "#d97706", criteria: "Maintain a 30-day learning streak", pts: 400, desc: "A month of pure dedication!", check: s => s.currentStreak >= 30 },
  { id: 16, name: "Legend", icon: "👑", category: "Consistency", color: "#d97706", criteria: "Maintain a 60-day learning streak", pts: 500, desc: "Two full months without a break!", check: s => s.currentStreak >= 60 },
  { id: 17, name: "Hall of Fame", icon: "🏛️", category: "Consistency", color: "#d97706", criteria: "Maintain a 100-day learning streak", pts: 750, desc: "Legendary dedication! 100 consecutive days of learning.", check: s => s.currentStreak >= 100 },
  { id: 18, name: "Iron Learner", icon: "⚙️", category: "Consistency", color: "#d97706", criteria: "Complete 200+ sessions", pts: 600, desc: "Iron will and iron dedication!", check: s => s.totalSessionsCompleted >= 200 },

  // 👥 COMMUNITY & ENGAGEMENT (Green)
  { id: 19, name: "Reviewer", icon: "📝", category: "Community", color: "#1d9e75", criteria: "Review 5 peer works", pts: 150, desc: "Peer reviewer! Your insights help others grow.", check: s => s.peerReviewsGiven >= 5 },
  { id: 20, name: "Voice of Community", icon: "🗣️", category: "Community", color: "#1d9e75", criteria: "Post 10 meaningful comments", pts: 200, desc: "Your voice matters!", check: s => s.meaningfulCommentsPosted >= 10 },
  { id: 21, name: "Advocate", icon: "🔗", category: "Community", color: "#1d9e75", criteria: "Refer 3 friends", pts: 300, desc: "Community builder!", check: s => s.referralCount >= 3 },
  { id: 22, name: "Supportive Peer", icon: "🤝", category: "Community", color: "#1d9e75", criteria: "Help 5 peers", pts: 250, desc: "Helpful hand!", check: s => s.peersHelpedCount >= 5 },
  { id: 23, name: "Mentor Trainee", icon: "👨‍🏫", category: "Community", color: "#1d9e75", criteria: "Complete mentoring program", pts: 350, desc: "Future mentor!", check: s => s.mentoringProgramCompleted },
  { id: 24, name: "Community Champion", icon: "🏆", category: "Community", color: "#1d9e75", criteria: "100+ community points", pts: 500, desc: "Champion of community!", check: s => s.communityEngagementPoints >= 100 },

  // 🏆 SPECIAL ACHIEVEMENTS (Silver/Platinum)
  { id: 25, name: "Quick Learner", icon: "✈️", category: "Special", color: "#cbd5e1", criteria: "Complete a course early", pts: 200, desc: "Speed demon! You're learning faster than expected.", check: s => false }, // Hard to mock accurately
  { id: 26, name: "Goal Crusher", icon: "🎯", category: "Special", color: "#cbd5e1", criteria: "Complete 3 personal goals", pts: 300, desc: "Goal achiever!", check: s => s.completedGoals >= 3 },
  { id: 27, name: "All-Rounder", icon: "🎨", category: "Special", color: "#cbd5e1", criteria: "Courses in 3 categories", pts: 250, desc: "Versatile learner!", check: s => s.uniqueCategoriesCompleted >= 3 },
  { id: 28, name: "Growth Hacker", icon: "🚀", category: "Special", color: "#cbd5e1", criteria: "Progress from Beginner to Advanced", pts: 400, desc: "Transformation master!", check: s => false },
  { id: 29, name: "Top Performer", icon: "⭐", category: "Special", color: "#cbd5e1", criteria: "Top 10% of cohort", pts: 450, desc: "Elite achiever!", check: s => s.cohortRanking <= 10 },
  { id: 30, name: "Platinum Scholar", icon: "💎", category: "Special", color: "#cbd5e1", criteria: "10 courses with 90%+", pts: 600, desc: "Platinum standard!", check: s => s.completedCourses >= 10 && s.averageAssessmentScore >= 90 },
];

export default function StudentProfileComponent({ skills = [], sessions = [], assessments = [], isOwnProfile = true }) {
  const router = useRouter();
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  
  const stats = useMemo(() => computeStats(skills, sessions, assessments), [skills, sessions, assessments]);
  
  const badges = useMemo(() => {
    return BADGE_DEFINITIONS.map(b => {
      const unlocked = b.check(stats);
      // Generate a mock progress percentage for locked badges based on stats
      let progress = 0;
      if (b.name === "First Step") progress = stats.completedCourses > 0 ? 100 : (stats.enrolledCourses ? 50 : 0);
      else if (b.name === "Course Master") progress = Math.min(100, Math.round((stats.completedCourses / 5) * 100));
      else if (b.name === "Dedicated") progress = Math.min(100, Math.round((stats.currentStreak / 7) * 100));
      else progress = Math.floor(Math.random() * 40); // Mock progress for others
      
      return { ...b, unlocked, progress: unlocked ? 100 : progress, unlockDate: unlocked ? new Date().toISOString().split('T')[0] : null };
    });
  }, [stats]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  const displayBadges = useMemo(() => {
    return isOwnProfile ? badges : badges.filter(b => b.unlocked);
  }, [isOwnProfile, badges]);

  const visibleBadges = showAllBadges ? displayBadges : displayBadges.slice(0, 8);

  const learnSkills = skills.filter(s => s.type === "learn");
  const inProgressCount = learnSkills.length;
  const completedCount = stats.completedCourses;
  const upcomingCount = sessions.filter(s => s.status === 'accepted' && new Date(s.scheduled_at) > new Date()).length;

  // Course Cards Data Generation
  const courseCards = useMemo(() => {
    return learnSkills.map(skill => {
      const skillSessions = sessions.filter(s => s.course?.skill_name === skill.skill_name || s.course?.title === skill.skill_name);
      const completedSkillSessions = skillSessions.filter(s => s.status === 'completed');
      const upcomingSkillSession = skillSessions.filter(s => s.status === 'accepted' && new Date(s.scheduled_at) > new Date())
        .sort((a,b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];
      
      const skillAssessments = assessments.filter(a => a.skill_name?.toLowerCase() === skill.skill_name?.toLowerCase());
      const latestScore = skillAssessments.length ? skillAssessments[skillAssessments.length - 1].score : null;

      let levelColor = '#4caf50'; // Beginner
      let levelBg = 'rgba(76, 175, 80, 0.2)';
      let levelBadge = '🟢 BEGINNER';
      if (skill.proficiency_level === 'Intermediate') {
        levelColor = '#ffc107'; levelBg = 'rgba(255, 193, 7, 0.2)'; levelBadge = '🟡 INTERMEDIATE';
      } else if (skill.proficiency_level === 'Advanced') {
        levelColor = '#9c27f0'; levelBg = 'rgba(156, 39, 176, 0.2)'; levelBadge = '🟣 ADVANCED';
      }

      const sessionsCompleted = completedSkillSessions.length;
      const totalSessions = Math.max(sessionsCompleted + 2, 10); // Default to 10 if new, or completed + 2
      const progress = Math.round((sessionsCompleted / totalSessions) * 100);

      return {
        id: skill.id,
        name: skill.skill_name || skill.name,
        icon: '💻', // Generic
        color: '#e8b84b',
        progress,
        sessionsCompleted,
        totalSessions,
        nextSession: upcomingSkillSession ? new Date(upcomingSkillSession.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : null,
        tutor: upcomingSkillSession?.tutor?.name || 'Assigned Tutor',
        levelBadge, levelColor, levelBg, latestScore
      };
    });
  }, [learnSkills, sessions, assessments]);

  return (
    <div className="sp-container">
      <style>{styles}</style>

      {/* SECTION 1: BADGES (Visible to All) */}
      <section className="sp-section" aria-label="Badges and Achievements">
        <div className="sp-header">
          <div className="flex items-center gap-3">
            <Award size={24} style={{ color: "#e8b84b" }} />
            <h2 className="text-xl font-bold" style={{ color: "#ffffff" }}>Badges & Achievements</h2>
          </div>
          <div className="flex items-center px-3 py-1 rounded-full" style={{ background: "rgba(232, 184, 75, 0.2)" }}>
            <span className="text-sm font-bold tracking-wide" style={{ color: "#e8b84b" }}>
              🏆 {unlockedCount} of 30
            </span>
          </div>
        </div>

        {displayBadges.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-[var(--text-secondary)]">
              {isOwnProfile ? "No badges earned yet." : "This student hasn't unlocked any badges yet."}
              {isOwnProfile && <><br/>Complete courses to unlock your first badge!</>}
            </p>
          </div>
        ) : (
          <>
            <div className="sp-badges-grid">
              {visibleBadges.map((badge, idx) => {
                const isUnlocked = badge.unlocked;
                return (
                  <div 
                    key={badge.id} 
                    className="sp-badge-card group" 
                    onClick={() => setSelectedBadge(badge)}
                    style={{ 
                      opacity: isUnlocked ? 1 : 0.7,
                      borderColor: isUnlocked ? badge.color : 'rgba(255,255,255,0.1)',
                      background: isUnlocked ? `${badge.color}25` : 'rgba(255,255,255,0.05)',
                      boxShadow: isUnlocked ? `0 0 15px ${badge.color}30, inset 0 0 10px ${badge.color}20` : 'none'
                    }}
                  >
                    <div className="sp-badge-icon-container">
                      <span style={{ 
                        opacity: isUnlocked ? 1 : 0.4, 
                        filter: isUnlocked ? 'none' : 'grayscale(80%) brightness(0.7)' 
                      }}>
                        {badge.icon}
                      </span>
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] opacity-60" style={{ color: "var(--text-secondary)" }}>
                          🔒
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {displayBadges.length > 8 && (
              <button 
                className="sp-show-more-btn"
                onClick={() => setShowAllBadges(!showAllBadges)}
              >
                {showAllBadges ? "Show Less" : `View All Badges (+${displayBadges.length - 8})`}
              </button>
            )}
          </>
        )}
      </section>

      {/* SECTION 2: LEARNING PROGRESS (Visible to All) */}
      <section className="sp-section" aria-label="Learning Progress" style={{ animationDelay: '0.2s' }}>
        <div className="sp-header">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} style={{ color: "#e8b84b" }} />
            <h2 className="text-xl font-bold" style={{ color: "#ffffff" }}>Learning Progress</h2>
          </div>
        </div>



        {/* Course Progress Cards */}
        {courseCards.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-[var(--border-color)]">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-[var(--text-secondary)] mb-4">No courses enrolled</p>
            {isOwnProfile && (
              <button 
                onClick={() => router.push('/explore')}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[var(--gold-primary)] text-[#0e0c0a] hover:bg-[#d4af37] transition-colors"
              >
                Browse Courses
              </button>
            )}
          </div>
        ) : (
          <div className="sp-course-grid">
            {courseCards.map((course, idx) => (
              <div 
                key={course.id} 
                className="sp-course-card group"
                style={{ 
                  borderTop: `4px solid ${course.color}`,
                  animation: `slideInUp 0.6s ease-out ${idx * 0.15}s forwards`,
                  opacity: 0 
                }}
              >
                <div className="flex gap-3 items-start mb-4">
                  <div className="text-3xl shrink-0">{course.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 truncate" title={course.name}>
                      {course.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">Tutor: {course.tutor}</p>
                  </div>
                </div>

                <div 
                  className="inline-flex gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide mb-4"
                  style={{ background: course.levelBg, color: course.levelColor }}
                >
                  {course.levelBadge}
                </div>

                <div className="my-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-[var(--text-secondary)]">{course.name}</span>
                    <span className="font-bold text-[var(--gold-primary)]">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--border-color)] overflow-hidden">
                    <div 
                      className="sp-progress-fill" 
                      style={{ '--progress-width': `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[rgba(42,37,32,0.4)] mb-4">
                  <div className="flex gap-1.5 text-xs text-[var(--text-secondary)]">
                    <span>📍</span>
                    <span><strong className="text-white">{course.sessionsCompleted}/{course.totalSessions}</strong> sessions</span>
                  </div>
                  <div className="flex gap-1.5 text-xs text-[var(--text-secondary)]">
                    <span>📅</span>
                    <span>{course.nextSession ? `Next: ${course.nextSession}` : 'No upcoming'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(42,37,32,0.4)]">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">Latest Assessment:</span>
                  <span className="text-base font-bold text-[var(--gold-primary)]">
                    {course.latestScore !== null ? `${course.latestScore}%` : 'Pending'}
                  </span>
                </div>

                {isOwnProfile && (
                  <button className="w-full mt-4 py-2.5 rounded-lg border-none font-bold text-xs uppercase tracking-wide cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,184,75,0.3)]"
                    style={{ background: 'linear-gradient(90deg, #e8b84b, #d4af37)', color: '#0e0c0a' }}
                    onClick={() => router.push(`/sessions`)}
                  >
                    CONTINUE LEARNING
                  </button>
                )}
              </div>
            ))}
          </div>
        )}


      </section>

      {/* Badge Modal Overlay */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6 border relative overflow-hidden"
              style={{ background: '#141210', borderColor: selectedBadge.unlocked ? selectedBadge.color : '#2a2520' }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center pt-4">
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-6xl mb-6 relative"
                  style={{ 
                    background: `${selectedBadge.color}15`,
                    filter: selectedBadge.unlocked ? 'none' : 'grayscale(100%)',
                    opacity: selectedBadge.unlocked ? 1 : 0.5
                  }}
                >
                  {selectedBadge.icon}
                  {!selectedBadge.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🔒</div>
                  )}
                </div>

                <div className="text-center mb-6">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block"
                    style={{ background: `${selectedBadge.color}20`, color: selectedBadge.color }}
                  >
                    {selectedBadge.category}
                  </span>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {selectedBadge.desc}
                  </p>
                </div>

                <div className="w-full bg-[#0a0908] rounded-xl p-4 mb-6 border border-[#2a2520]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[var(--text-secondary)]">Requirement</span>
                    <span className="text-xs font-bold" style={{ color: selectedBadge.color }}>{selectedBadge.pts} PTS</span>
                  </div>
                  <p className="text-sm font-medium text-white">{selectedBadge.criteria}</p>
                  
                  {!selectedBadge.unlocked && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[var(--text-secondary)]">Progress</span>
                        <span className="font-bold text-white">{selectedBadge.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#2a2520] overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--text-secondary)]" style={{ width: `${selectedBadge.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Related Badges Section */}
                <div className="w-full mb-6 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Related Badges</span>
                    <button className="text-[10px] font-bold text-[var(--gold-primary)] hover:underline uppercase tracking-wider">
                      View All
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {badges.filter(b => b.category === selectedBadge.category && b.id !== selectedBadge.id).slice(0, 3).map(related => (
                      <div 
                        key={related.id} 
                        onClick={(e) => { e.stopPropagation(); setSelectedBadge(related); }}
                        className="flex-1 bg-[#1d1a17] border border-[#2a2520] rounded-lg p-2 flex flex-col items-center cursor-pointer hover:border-[var(--gold-primary)] transition-colors"
                      >
                        <span className="text-lg mb-1" style={{ opacity: related.unlocked ? 1 : 0.4 }}>{related.icon}</span>
                        <span className="text-[8px] font-bold text-center text-white truncate w-full">{related.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedBadge.unlocked && (
                  <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white transition-colors">
                    <Share2 size={16} /> Share Achievement
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
