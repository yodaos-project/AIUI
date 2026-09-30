import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateRequestCost, PRICING_AS_OF, PRICING_SOURCE } from '../src/pricing.js';

test('DeepSeek pricing uses cache tiers and UTC peak hours per request', () => {
  const usage = {
    prompt_tokens: 1_000_000,
    prompt_cache_hit_tokens: 500_000,
    prompt_cache_miss_tokens: 500_000,
    completion_tokens: 100_000,
  };
  const peak = estimateRequestCost({ model: 'deepseek-flash', usage, at: new Date('2026-09-28T01:30:00Z') });
  const offPeak = estimateRequestCost({ model: 'deepseek-flash', usage, at: new Date('2026-09-28T04:00:00Z') });

  assert.equal(peak.tier, 'peak');
  assert.equal(peak.estimatedUsd, 0.273);
  assert.equal(offPeak.tier, 'offPeak');
  assert.equal(offPeak.estimatedUsd, 0.1365);
  assert.equal(estimateRequestCost({ model: 'deepseek-flash', usage, at: new Date('2026-09-28T06:00:00Z') }).tier, 'peak');
  assert.equal(estimateRequestCost({ model: 'deepseek-flash', usage, at: new Date('2026-09-28T10:00:00Z') }).tier, 'offPeak');
  assert.equal(peak.currency, 'USD');
  assert.equal(peak.pricingSource, PRICING_SOURCE);
  assert.equal(peak.pricingAsOf, PRICING_AS_OF);
});

test('DeepSeek pro pricing and cached-token fallback use the published USD table', () => {
  const cost = estimateRequestCost({
    model: 'deepseek-v4-pro',
    usage: {
      prompt_tokens: 1_000_000,
      prompt_tokens_details: { cached_tokens: 500_000 },
      completion_tokens: 100_000,
    },
    at: new Date('2026-09-26T08:00:00Z'),
  });
  assert.equal(cost.tier, 'offPeak');
  assert.equal(cost.estimatedUsd, 0.539);
});

test('unavailable or inconsistent usage never becomes a zero-dollar estimate', () => {
  const at = new Date('2026-09-28T01:30:00Z');
  assert.equal(estimateRequestCost({ model: 'deepseek-flash', usage: null, at }), null);
  assert.equal(estimateRequestCost({ model: 'deepseek-flash', usage: { prompt_tokens: 10, completion_tokens: 1 }, at }), null);
  assert.equal(estimateRequestCost({ model: 'deepseek-flash', usage: { prompt_tokens: 10, prompt_cache_hit_tokens: 3, prompt_cache_miss_tokens: 6, completion_tokens: 1 }, at }), null);
  assert.equal(estimateRequestCost({ model: 'other-provider', usage: { prompt_tokens: 1, prompt_cache_hit_tokens: 0, prompt_cache_miss_tokens: 1, completion_tokens: 1 }, at }), null);
});
