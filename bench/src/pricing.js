/**
 * Estimate DeepSeek API charges from the token counts returned by each request.
 * Rates are a dated snapshot, not a provider invoice. Update this table when
 * DeepSeek changes its published pricing before using it for new runs.
 * @module pricing
 */

export const PRICING_SOURCE = 'https://api-docs.deepseek.com/quick_start/pricing/';
export const PRICING_AS_OF = '2026-09-30';

/** USD per million tokens: cache hit input, cache miss input, and output. */
const RATES = {
  'deepseek-flash': {
    peak: { cacheHit: 0.006, cacheMiss: 0.3, output: 1.2 },
    offPeak: { cacheHit: 0.003, cacheMiss: 0.15, output: 0.6 },
  },
  'deepseek-v4-pro': {
    peak: { cacheHit: 0.044, cacheMiss: 1.32, output: 3.96 },
    offPeak: { cacheHit: 0.022, cacheMiss: 0.66, output: 1.98 },
  },
};

/** Peak is 01:00–04:00 and 06:00–10:00 UTC, Monday through Friday. */
function pricingTier(at) {
  const day = at.getUTCDay();
  const hour = at.getUTCHours();
  return day >= 1 && day <= 5 && ((hour >= 1 && hour < 4) || (hour >= 6 && hour < 10))
    ? 'peak'
    : 'offPeak';
}

/**
 * Return a USD estimate for one successful API response, or null when its
 * model or token breakdown is insufficient to calculate a trustworthy amount.
 * Cache hits may also be supplied as prompt_tokens_details.cached_tokens.
 * @param {{model: string, usage: object | null, at: Date}} request
 * @returns {{currency: 'USD', estimatedUsd: number, tier: string, ratesUsdPerMillion: object, pricingSource: string, pricingAsOf: string} | null}
 */
export function estimateRequestCost({ model, usage, at }) {
  if (!Object.hasOwn(RATES, model) || !(at instanceof Date) || Number.isNaN(at.valueOf()) || !usage) return null;

  const prompt = usage.prompt_tokens;
  const output = usage.completion_tokens;
  const cacheHit = usage.prompt_cache_hit_tokens ?? usage.prompt_tokens_details?.cached_tokens;
  const cacheMiss = usage.prompt_cache_miss_tokens ?? (Number.isInteger(cacheHit) ? prompt - cacheHit : undefined);
  if (![prompt, output, cacheHit, cacheMiss].every(value => Number.isSafeInteger(value) && value >= 0)
      || cacheHit + cacheMiss !== prompt) return null;

  const tier = pricingTier(at);
  const ratesUsdPerMillion = RATES[model][tier];
  const estimatedUsd = (cacheHit * ratesUsdPerMillion.cacheHit
    + cacheMiss * ratesUsdPerMillion.cacheMiss
    + output * ratesUsdPerMillion.output) / 1_000_000;

  return {
    currency: 'USD',
    estimatedUsd,
    tier,
    ratesUsdPerMillion,
    pricingSource: PRICING_SOURCE,
    pricingAsOf: PRICING_AS_OF,
  };
}
