<script setup>
import { createOpenAPI } from 'open';

function findFirstCallableMethod(api) {
  const namespaces = Object.keys(api || {}).sort();
  for (const namespace of namespaces) {
    const group = api[namespace] || {};
    const methods = Object.keys(group).sort();
    for (const name of methods) {
      if (typeof group[name] === 'function') {
        return { namespace, name, label: `${namespace}.${name}` };
      }
    }
  }
  return null;
}

export default {
  data: {
    status: 'idle',
    readinessText: 'Preparing launcher',
    capabilityCount: 0,
    primaryMethodLabel: 'No launch action',
    launchOutcome: '入口初始化后，这里会显示最近一次启动结果。',
    error: '',
  },

  async onLoad() {
    try {
      this.api = await createOpenAPI();
      const firstMethod = findFirstCallableMethod(this.api);
      const capabilityCount = Object.keys(this.api || {}).reduce((count, namespace) => {
        const group = this.api[namespace] || {};
        return count + Object.keys(group).filter((name) => typeof group[name] === 'function').length;
      }, 0);

      this.primaryNamespace = firstMethod ? firstMethod.namespace : '';
      this.primaryMethod = firstMethod ? firstMethod.name : '';

      this.setData({
        status: firstMethod ? 'ready' : 'empty',
        readinessText: firstMethod ? 'Launcher is ready' : 'No launchable entries were found',
        capabilityCount,
        primaryMethodLabel: firstMethod ? firstMethod.label : 'No launch action',
      });
    } catch (err) {
      this.setData({
        status: 'error',
        readinessText: 'Launcher initialization failed',
        error: String(err),
      });
    }
  },

  async callPrimaryMethod() {
    if (!this.api || !this.primaryNamespace || !this.primaryMethod) {
      this.setData({
        status: 'error',
        launchOutcome: '当前没有可执行的外部入口。',
        error: 'No launchable action was generated.',
      });
      return;
    }

    const fn = this.api[this.primaryNamespace] && this.api[this.primaryNamespace][this.primaryMethod];
    if (typeof fn !== 'function') {
      this.setData({
        status: 'error',
        launchOutcome: '所选入口当前不可用。',
        error: 'Selected action is not callable.',
      });
      return;
    }

    this.setData({
      status: 'loading',
      launchOutcome: '正在发起外部入口动作...',
      error: '',
    });

    try {
      const res = await fn();
      const text = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
      this.setData({
        status: 'success',
        readinessText: 'Launcher completed',
        launchOutcome: text || 'External action finished successfully.',
      });
    } catch (err) {
      this.setData({
        status: 'error',
        readinessText: 'Launcher failed',
        launchOutcome: '入口调用失败，请检查宿主是否支持该动作。',
        error: String(err),
      });
    }
  },
};
</script>

<page>
  <view class="container">
    <view class="hero-card">
      <text class="page-kicker">Network &amp; Integration</text>
      <text class="page-title">External Entry Launcher</text>
      <text class="page-description">
        把 `open` 能力变成一个真实可用的入口中心，重点展示可启动动作，而不是运行时对象结构。
      </text>
    </view>

    <view class="card">
      <text class="section-title">Primary Launch Card</text>
      <text class="meta-line">Status: {{status}} · Actions: {{capabilityCount}}</text>
      <text class="meta-line">Primary: {{primaryMethodLabel}}</text>
      <text class="meta-line">{{readinessText}}</text>
      <text class="meta-line" ink:if="{{error}}">Error: {{error}}</text>
      <text class="body-text">{{launchOutcome}}</text>
    </view>

    <card class="card">
      <view class="button-row" role="navigation">
        <button class="btn" bindtap="callPrimaryMethod">Launch Primary Action</button>
      </view>
    </card>
  </view>
</page>

<style>
  .container {
    display: flex;
    flex-direction: column;
    padding: var(--theme-padding, 20px);
    gap: 16px;
    background-color: var(--color-background);
  }

  .hero-card,
  .card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: var(--spacing-md, 16px);
    border-radius: var(--radius-md, 12px);
    background-color: var(--color-surface);
    border: var(--border-width-thin, 1px) solid var(--border-color-default, #e5e5ea);
  }

  .page-kicker {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .page-title {
    font-size: 28px;
    font-weight: bold;
    color: var(--color-text-primary);
  }

  .page-description,
  .meta-line,
  .body-text {
    font-size: 14px;
    line-height: 20px;
    color: var(--color-text-secondary);
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: var(--color-text-primary);
  }

  .button-row {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }

  .btn {
    flex: 1;
    font-size: 15px;
  }
</style>
