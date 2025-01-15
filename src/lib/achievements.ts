import Achievement from "@/models/achievement";
import Analysis from "@/models/analysis";
import Post from "@/models/post";
import Template from "@/models/template";
import Challenge from "@/models/challenge";

export const ACHIEVEMENTS = {
  ANALYSIS: {
    FIRST_ANALYSIS: {
      name: "First Analysis",
      description: "Complete your first prompt analysis",
      icon: "🎯",
      category: "analysis",
    },
    PERFECT_SCORE: {
      name: "Perfect Score",
      description: "Get a perfect score in any category",
      icon: "⭐",
      category: "analysis",
    },
    ANALYSIS_MASTER: {
      name: "Analysis Master",
      description: "Complete 10 analyses",
      icon: "🎓",
      category: "analysis",
    },
  },
  COMMUNITY: {
    FIRST_POST: {
      name: "First Post",
      description: "Create your first community post",
      icon: "📝",
      category: "community",
    },
    POPULAR_POST: {
      name: "Popular Post",
      description: "Get 5 likes on a post",
      icon: "🔥",
      category: "community",
    },
    ACTIVE_COMMENTER: {
      name: "Active Commenter",
      description: "Make 5 comments on community posts",
      icon: "💬",
      category: "community",
    },
  },
  TEMPLATE: {
    TEMPLATE_CREATOR: {
      name: "Template Creator",
      description: "Create your first template",
      icon: "📋",
      category: "template",
    },
    TEMPLATE_MASTER: {
      name: "Template Master",
      description: "Have your templates used 10 times",
      icon: "🏆",
      category: "template",
    },
  },
  CHALLENGE: {
    CHALLENGER: {
      name: "Challenger",
      description: "Create your first challenge",
      icon: "🎮",
      category: "challenge",
    },
    CHALLENGE_MASTER: {
      name: "Challenge Master",
      description: "Complete 5 challenges",
      icon: "🌟",
      category: "challenge",
    },
  },
};

export async function checkAnalysisAchievements(userId: string) {
  const analyses = await Analysis.find({ author: userId });
  const achievements = [];

  // First Analysis Achievement
  if (analyses.length === 1) {
    achievements.push(ACHIEVEMENTS.ANALYSIS.FIRST_ANALYSIS);
  }

  // Analysis Master Achievement
  if (analyses.length === 10) {
    achievements.push(ACHIEVEMENTS.ANALYSIS.ANALYSIS_MASTER);
  }

  // Perfect Score Achievement
  const hasPerfectScore = analyses.some((analysis) =>
    Object.values(analysis.scores).some((score) => score === 100)
  );
  if (hasPerfectScore) {
    achievements.push(ACHIEVEMENTS.ANALYSIS.PERFECT_SCORE);
  }

  return achievements;
}

export async function checkCommunityAchievements(userId: string) {
  const posts = await Post.find({ author: userId });
  const achievements = [];

  // First Post Achievement
  if (posts.length === 1) {
    achievements.push(ACHIEVEMENTS.COMMUNITY.FIRST_POST);
  }

  // Popular Post Achievement
  const hasPopularPost = posts.some((post) => post.likes?.length >= 5);
  if (hasPopularPost) {
    achievements.push(ACHIEVEMENTS.COMMUNITY.POPULAR_POST);
  }

  // Active Commenter Achievement
  const comments = await Post.aggregate([
    { $unwind: "$comments" },
    { $match: { "comments.author": userId } },
    { $count: "commentCount" },
  ]);
  if (comments[0]?.commentCount >= 5) {
    achievements.push(ACHIEVEMENTS.COMMUNITY.ACTIVE_COMMENTER);
  }

  return achievements;
}

export async function checkTemplateAchievements(userId: string) {
  const templates = await Template.find({ author: userId });
  const achievements = [];

  // Template Creator Achievement
  if (templates.length === 1) {
    achievements.push(ACHIEVEMENTS.TEMPLATE.TEMPLATE_CREATOR);
  }

  // Template Master Achievement
  const totalUses = templates.reduce((sum, template) => sum + (template.usageCount || 0), 0);
  if (totalUses >= 10) {
    achievements.push(ACHIEVEMENTS.TEMPLATE.TEMPLATE_MASTER);
  }

  return achievements;
}

export async function checkChallengeAchievements(userId: string) {
  const createdChallenges = await Challenge.find({ author: userId });
  const completedChallenges = await Challenge.find({
    "submissions.author": userId,
  });
  const achievements = [];

  // Challenger Achievement
  if (createdChallenges.length === 1) {
    achievements.push(ACHIEVEMENTS.CHALLENGE.CHALLENGER);
  }

  // Challenge Master Achievement
  if (completedChallenges.length >= 5) {
    achievements.push(ACHIEVEMENTS.CHALLENGE.CHALLENGE_MASTER);
  }

  return achievements;
}

export async function awardAchievement(userId: string, achievement: typeof ACHIEVEMENTS.ANALYSIS.FIRST_ANALYSIS) {
  const existingAchievement = await Achievement.findOne({
    userId,
    name: achievement.name,
  });

  if (!existingAchievement) {
    await Achievement.create({
      userId,
      ...achievement,
    });
    return true;
  }

  return false;
}

export async function getUserAchievements(userId: string) {
  return Achievement.find({ userId }).sort({ earnedAt: -1 });
} 