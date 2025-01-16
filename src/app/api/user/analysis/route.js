import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Analysis from "@/models/analysis";
import { getUserAchievements } from "@/lib/achievements";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Dashboard - Session user:", {
      id: session.user.id,
      email: session.user.email,
    });

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    console.log("Looking for analyses with userId:", userId.toString());

    const analysisCount = await Analysis.countDocuments({ author: userId });
    console.log("Total analyses found:", analysisCount);

    const analyses = await Analysis.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "author",
        select: "_id name email",
        transform: (doc) => ({
          _id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
        }),
      })
      .lean();

    if (!analyses || analyses.length === 0) {
      console.log(
        "No analyses found for user. Checking database connection and user ID..."
      );
      const isConnected = mongoose.connection.readyState === 1;
      console.log(
        "Database connection status:",
        isConnected ? "Connected" : "Not connected"
      );

      if (!mongoose.connection.db) {
        throw new Error("Database connection not established");
      }
      const userExists = await mongoose.connection.db
        .collection("users")
        .findOne({ _id: userId });
      console.log("User exists in database:", !!userExists);

      return NextResponse.json({
        analyses: [],
        achievements: [],
        stats: {
          averageScores: {
            style: 0,
            grammar: 0,
            creativity: 0,
            clarity: 0,
            relevance: 0,
          },
          totalAnalyses: 0,
          modeStats: {},
        },
        trend: [],
      });
    }

    const achievements = await getUserAchievements(session.user.id);
    console.log("User achievements:", achievements.length);

    const allAnalyses = await Analysis.find({ author: userId }).lean();
    const totalAnalyses = allAnalyses.length;

    console.log("All analyses for stats:", {
      total: totalAnalyses,
      modes: allAnalyses.map((a) => a.mode),
    });

    const averageScores = {
      style: 0,
      grammar: 0,
      creativity: 0,
      clarity: 0,
      relevance: 0,
    };

    const modeStats = {};

    allAnalyses.forEach((analysis) => {
      if (!analysis.scores) return;

      Object.keys(averageScores).forEach((key) => {
        averageScores[key] += analysis.scores[key] || 0;
      });

      if (!modeStats[analysis.mode]) {
        modeStats[analysis.mode] = { count: 0, totalScore: 0 };
      }
      modeStats[analysis.mode].count += 1;
      const avgScore =
        Object.values(analysis.scores).reduce((a, b) => a + (b || 0), 0) / 5;
      modeStats[analysis.mode].totalScore += avgScore;
    });

    if (totalAnalyses > 0) {
      Object.keys(averageScores).forEach((key) => {
        averageScores[key] =
          Math.round((averageScores[key] / totalAnalyses) * 100) / 100;
      });
    }

    const finalModeStats = {};
    Object.entries(modeStats).forEach(([mode, stats]) => {
      finalModeStats[mode] = {
        count: stats.count,
        avgScore: Math.round((stats.totalScore / stats.count) * 100) / 100,
      };
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const trendData = await Analysis.aggregate([
      {
        $match: {
          author: userId,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          avgScore: {
            $avg: {
              $avg: [
                { $ifNull: ["$scores.style", 0] },
                { $ifNull: ["$scores.grammar", 0] },
                { $ifNull: ["$scores.creativity", 0] },
                { $ifNull: ["$scores.clarity", 0] },
                { $ifNull: ["$scores.relevance", 0] },
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" },
                },
              },
            ],
          },
          avgScore: { $round: ["$avgScore", 2] },
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    const trend = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(date.getMonth() + i);
      const yearMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const existingData = trendData.find((d) => d.date === yearMonth);
      if (existingData) {
        trend.push(existingData);
      } else {
        trend.push({ date: yearMonth, avgScore: 0, count: 0 });
      }
    }

    const transformedAnalyses = analyses.map((analysis) => ({
      _id: analysis._id.toString(),
      prompt: analysis.prompt,
      mode: analysis.mode,
      scores: analysis.scores,
      createdAt: analysis.createdAt,
      author:
        typeof analysis.author === "object"
          ? analysis.author._id.toString()
          : analysis.author.toString(),
    }));

    return NextResponse.json({
      analyses: transformedAnalyses,
      achievements,
      stats: {
        averageScores,
        totalAnalyses,
        modeStats: finalModeStats,
      },
      trend,
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
