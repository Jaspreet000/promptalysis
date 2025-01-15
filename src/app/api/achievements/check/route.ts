import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  checkAnalysisAchievements,
  checkCommunityAchievements,
  checkTemplateAchievements,
  checkChallengeAchievements,
  awardAchievement,
} from "@/lib/achievements";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { category } = await request.json();
    const userId = session.user.id;
    let newAchievements = [];

    // Check achievements based on category
    switch (category) {
      case "analysis":
        newAchievements = await checkAnalysisAchievements(userId);
        break;
      case "community":
        newAchievements = await checkCommunityAchievements(userId);
        break;
      case "template":
        newAchievements = await checkTemplateAchievements(userId);
        break;
      case "challenge":
        newAchievements = await checkChallengeAchievements(userId);
        break;
      default:
        // Check all categories if none specified
        const [analysis, community, template, challenge] = await Promise.all([
          checkAnalysisAchievements(userId),
          checkCommunityAchievements(userId),
          checkTemplateAchievements(userId),
          checkChallengeAchievements(userId),
        ]);
        newAchievements = [
          ...analysis,
          ...community,
          ...template,
          ...challenge,
        ];
    }

    // Award new achievements
    const awardedAchievements = await Promise.all(
      newAchievements.map(async (achievement) => {
        const awarded = await awardAchievement(userId, achievement);
        return awarded ? achievement : null;
      })
    );

    // Filter out null values (already awarded achievements)
    const actuallyAwarded = awardedAchievements.filter(Boolean);

    return NextResponse.json({
      awarded: actuallyAwarded,
    });
  } catch (error) {
    console.error("Achievement check error:", error);
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 }
    );
  }
} 