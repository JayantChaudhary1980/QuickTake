import User from "../models/User.js";
import Analysis from "../models/Analysis.js";
import ApiUsage from "../models/ApiUsage.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Parallelize independent queries
    const totalUsersPromise = User.countDocuments();
    const totalAnalysesPromise = Analysis.countDocuments();

    const totalSecondsPromise = Analysis.aggregate([
      { $group: { _id: null, totalSeconds: { $sum: "$durationSeconds" } } },
    ]);

    const recentUsersPromise = User.find()
      .sort({ createdAt: -1 })
      .select("name email role createdAt")
      .lean();

    const recentAnalysesPromise = Analysis.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .select("title sourceType durationSeconds status createdAt userId")
      .lean();

    // New admin metrics promises
    const apiRequestsTotalPromise = ApiUsage.countDocuments();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const apiRequestsTodayPromise = ApiUsage.countDocuments({ createdAt: { $gte: startOfToday } });
    const successfulApiRequestsPromise = ApiUsage.countDocuments({ success: true });
    const failedApiRequestsPromise = ApiUsage.countDocuments({ success: false });
    const totalTokensUsedPromise = ApiUsage.aggregate([
      { $group: { _id: null, totalTokens: { $sum: "$totalTokens" } } },
    ]);

    // unique users who have at least one analysis
    const usersWithAnalysesPromise = Analysis.distinct("userId");

    // mostUsedAnalysisType and counts per sourceType
    const mostUsedAnalysisTypePromise = Analysis.aggregate([
      { $group: { _id: "$sourceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const sourceTypeCountsPromise = Analysis.aggregate([
      { $group: { _id: "$sourceType", count: { $sum: 1 } } },
    ]);

    const [
      totalUsers,
      totalAnalyses,
      totalSecondsAgg,
      recentUsers,
      recentAnalysesRaw,
      apiRequestsTotal,
      apiRequestsToday,
      successfulApiRequests,
      failedApiRequests,
      totalTokensAgg,
      mostUsedAnalysisTypeAgg,
      sourceTypeCounts,
      usersWithAnalysesArr,
    ] = await Promise.all([
      totalUsersPromise,
      totalAnalysesPromise,
      totalSecondsPromise,
      recentUsersPromise,
      recentAnalysesPromise,
      apiRequestsTotalPromise,
      apiRequestsTodayPromise,
      successfulApiRequestsPromise,
      failedApiRequestsPromise,
      totalTokensUsedPromise,
      mostUsedAnalysisTypePromise,
      sourceTypeCountsPromise,
      usersWithAnalysesPromise,
    ]);

    const totalSeconds = (totalSecondsAgg && totalSecondsAgg[0] && totalSecondsAgg[0].totalSeconds) || 0;
    const totalMinutesProcessed = Math.round((Number(totalSeconds) / 60) * 10) / 10; // rounded to 1 decimal

    const recentAnalyses = recentAnalysesRaw.map((a) => ({
      title: a.title,
      sourceType: a.sourceType,
      durationSeconds: a.durationSeconds || 0,
      status: a.status,
      createdAt: a.createdAt,
      userName: a.userId ? a.userId.name : undefined,
    }));

    const totalTokensUsed = (totalTokensAgg && totalTokensAgg[0] && totalTokensAgg[0].totalTokens) || 0;

    const mostUsedAnalysisType = (mostUsedAnalysisTypeAgg && mostUsedAnalysisTypeAgg[0] && mostUsedAnalysisTypeAgg[0]._id) || null;

    // Build counts per sourceType with defaults
    const countsByType = (sourceTypeCounts || []).reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const uploadCount = countsByType["UPLOAD"] || 0;
    const youtubeCount = countsByType["YOUTUBE"] || 0;
    const liveCaptureCount = countsByType["LIVE_CAPTURE"] || 0;

    const usersWithAnalyses = (usersWithAnalysesArr && usersWithAnalysesArr.length) || 0;

    res.json({
      totalUsers,
      totalAnalyses,
      totalMinutesProcessed,
      recentUsers,
      recentAnalyses,

      // API usage metrics
      apiRequestsTotal,
      apiRequestsToday,
      successfulApiRequests,
      failedApiRequests,
      totalTokensUsed,

      // Analysis type metrics
      mostUsedAnalysisType,
      uploadCount,
      youtubeCount,
      liveCaptureCount,

      // new metric
      usersWithAnalyses,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export default { getDashboardStats };
