import ApiUsage from "../models/ApiUsage.js";

export async function recordApiUsage({ provider = "GROQ", userId, analysisId, usage = {}, success = true }) {
  try {
    const inputTokens = Number(usage.input_tokens ?? usage.prompt_tokens ?? usage.inputTokens ?? 0) || 0;
    const outputTokens = Number(usage.output_tokens ?? usage.completion_tokens ?? usage.outputTokens ?? 0) || 0;
    const totalTokens = Number(usage.total_tokens ?? usage.totalTokens ?? (inputTokens + outputTokens)) || 0;

    await ApiUsage.create({
      provider,
      userId,
      analysisId,
      inputTokens,
      outputTokens,
      totalTokens,
      success: !!success,
    });
  } catch (err) {
    console.error("Failed to record API usage:", err);
  }
}

export default { recordApiUsage };
