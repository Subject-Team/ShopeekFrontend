import { describe, it, expect } from 'vitest';
import { GUIDE_CONFIGS } from '../guideSteps';

describe('guideSteps configuration validation', () => {
  it('has configurations for all 5 dashboard pages', () => {
    expect(GUIDE_CONFIGS).toHaveProperty('dashboard');
    expect(GUIDE_CONFIGS).toHaveProperty('ingestion');
    expect(GUIDE_CONFIGS).toHaveProperty('customers');
    expect(GUIDE_CONFIGS).toHaveProperty('analytics');
    expect(GUIDE_CONFIGS).toHaveProperty('settings');
  });

  it('each guide page config has valid steps with selectors and titles', () => {
    Object.entries(GUIDE_CONFIGS).forEach(([pageKey, config]) => {
      expect(config.pageKey).toBe(pageKey);
      expect(config.title).toBeTruthy();
      expect(config.steps.length).toBeGreaterThan(0);

      config.steps.forEach((step) => {
        expect(step.id).toBeTruthy();
        expect(step.targetSelector).toBeTruthy();
        expect(step.targetSelector).toContain('data-guide=');
        expect(step.title).toBeTruthy();
        expect(step.description).toBeTruthy();
      });
    });
  });

  it('dashboard guide has critical steps including KPIs, chart, advisory, and subscription', () => {
    const dashboardStepIds = GUIDE_CONFIGS.dashboard.steps.map((s) => s.id);
    expect(dashboardStepIds).toContain('dashboard-kpis');
    expect(dashboardStepIds).toContain('dashboard-chart');
    expect(dashboardStepIds).toContain('dashboard-advisory');
    expect(dashboardStepIds).toContain('dashboard-subscription');
  });

  it('settings guide has critical steps for tabs, profile, password, sessions, and telegram', () => {
    const settingsStepIds = GUIDE_CONFIGS.settings.steps.map((s) => s.id);
    expect(settingsStepIds).toContain('settings-tabs');
    expect(settingsStepIds).toContain('settings-profile');
    expect(settingsStepIds).toContain('settings-password');
    expect(settingsStepIds).toContain('settings-sessions');
    expect(settingsStepIds).toContain('settings-telegram');
  });
});
