import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateObject } from "ai";
import type { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Resilient provider registry — ordered failover across multiple AI providers
// ─────────────────────────────────────────────────────────────────────────────

type ProviderEntry = {
  name: string;
  caller: (model: string) => any;
  /** Map of purpose → model name (e.g. { teacher_answer: "gpt-4o-mini" }). */
  modelMap: Record<string, string>;
  priority: number; // lower = tried first
};

/** Time in ms before we give up on a flaky primary and try the next provider. */
const PER_PROVIDER_TIMEOUT_MS = 12_000;

/**
 * Build the ordered list of available providers from environment variables.
 * Each key that is present creates a provider entry; entries are sorted by
 * priority so the primary is tried first.
 */
function buildProviderChain(): ProviderEntry[] {
  const providers: ProviderEntry[] = [];

  // Allowed OpenAI models only: gpt-4o-mini, gpt-5-nano, gpt-4.1-nano.
  // gpt-4o-mini handles the heavier/quality-sensitive purposes; gpt-5-nano
  // covers fast interactive turns; gpt-4.1-nano handles cheap classification.
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    providers.push({
      name: "openai",
      caller: createOpenAICompatible({
        name: "openai",
        baseURL: "https://api.openai.com/v1",
        apiKey: openaiKey,
      }),
      modelMap: {
        teacher_answer: "gpt-4o-mini",
        teacher_turn: "gpt-5-nano",
        lesson_gen: "gpt-4o-mini",
        sentiment: "gpt-4.1-nano",
        adaptive_intervention: "gpt-5-nano",
      },
      priority: 0,
    });
  }

  // DeepSeek always uses deepseek-v4-flash — the only model in use for now.
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    providers.push({
      name: "deepseek",
      caller: createOpenAICompatible({
        name: "deepseek",
        baseURL: "https://api.deepseek.com/v1",
        apiKey: deepseekKey,
      }),
      modelMap: {
        teacher_answer: "deepseek-v4-flash",
        teacher_turn: "deepseek-v4-flash",
        lesson_gen: "deepseek-v4-flash",
        sentiment: "deepseek-v4-flash",
        adaptive_intervention: "deepseek-v4-flash",
      },
      // DeepSeek is secondary to OpenAI if both keys are present, primary
      // otherwise (mirrors the original ternary logic).
      priority: openaiKey ? 1 : 0,
    });
  }

  return providers.sort((a, b) => a.priority - b.priority);
}

export type ResilientModelCaller = {
  /**
   * Call `generateObject` with automatic provider failover.
   * Returns `null` if all providers fail (caller should use its deterministic fallback).
   */
  call: <T extends z.ZodType<any>>(
    schema: T,
    system: string,
    prompt: string,
  ) => Promise<{ object: z.infer<T>; provider: string } | null>;
  /** Which provider would be tried first (useful for logging). */
  primaryProvider: string;
};

/**
 * Create a resilient model caller for a given purpose (e.g. "teacher_answer").
 *
 * The caller walks the provider chain on failure:
 *   Provider A → (error/timeout) → Provider B → (error/timeout) → null
 *
 * The caller returns `null` when all providers fail so the consumer can fall
 * back to its deterministic path — the lesson is never blocked by an AI outage.
 */
export function createResilientModelCaller(purpose: string): ResilientModelCaller | null {
  const chain = buildProviderChain();
  if (chain.length === 0) return null;

  const primaryProvider = chain[0].name;

  const call: ResilientModelCaller["call"] = async (schema, system, prompt) => {
    let lastError: unknown = null;

    for (const provider of chain) {
      const modelName =
        provider.modelMap[purpose] ?? provider.modelMap["teacher_answer"] ?? "gpt-4o-mini";
      try {
        const result = await Promise.race([
          generateObject({
            model: provider.caller(modelName),
            schema,
            system,
            prompt,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Provider ${provider.name} timed out`)),
              PER_PROVIDER_TIMEOUT_MS,
            ),
          ),
        ]);
        return { object: result.object as any, provider: provider.name };
      } catch (err) {
        lastError = err;
        // Log the failure but do not throw — try the next provider.
        console.warn(
          `[ai-gateway] Provider "${provider.name}" failed for purpose "${purpose}":`,
          err instanceof Error ? err.message : err,
        );
      }
    }

    // All providers exhausted — signal to the caller that it should use its
    // deterministic fallback.
    console.error(
      `[ai-gateway] All providers failed for purpose "${purpose}". Last error:`,
      lastError instanceof Error ? lastError.message : lastError,
    );
    return null;
  };

  return { call, primaryProvider };
}
