import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchCampaignsOverview,
  createCampaign,
  deleteCampaign,
} from '../api/campaigns';

vi.mock('../api/client', () => ({
  authFetch: vi.fn(),
}));

import { authFetch } from '../api/client';

describe('Campaigns API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchCampaignsOverview calls GET /api/v1/campaigns', async () => {
    const mockOverview = {
      campaigns: [],
      active_campaign: null,
      summary: { total_cost: 0, total_lift: 0, avg_roas: 0, total_new_customers: 0, active_campaigns_count: 0 },
    };
    vi.mocked(authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOverview,
    } as unknown as Response);

    const res = await fetchCampaignsOverview();
    expect(authFetch).toHaveBeenCalledWith('/api/v1/campaigns');
    expect(res).toEqual(mockOverview);
  });

  it('createCampaign sends POST and returns campaign', async () => {
    const payload = {
      title: 'استوری صدف',
      cost: 5000000,
      start_date: '2026-11-02T10:00:00Z',
      end_date: '2026-11-04T10:00:00Z',
    };
    const mockCreated = { id: 'camp-1', ...payload };
    vi.mocked(authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreated,
    } as unknown as Response);

    const res = await createCampaign(payload);
    expect(authFetch).toHaveBeenCalledWith('/api/v1/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(res).toEqual(mockCreated);
  });

  it('createCampaign throws error message from response on failure', async () => {
    vi.mocked(authFetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'زمان پایان باید بعد از شروع باشد.' }),
    } as unknown as Response);

    await expect(
      createCampaign({
        title: 'خطا',
        cost: 100,
        start_date: '2026-11-04T10:00:00Z',
        end_date: '2026-11-02T10:00:00Z',
      })
    ).rejects.toThrow('زمان پایان باید بعد از شروع باشد.');
  });

  it('deleteCampaign calls DELETE /api/v1/campaigns/:id', async () => {
    vi.mocked(authFetch).mockResolvedValueOnce({
      ok: true,
    } as unknown as Response);

    await deleteCampaign('camp-1');
    expect(authFetch).toHaveBeenCalledWith('/api/v1/campaigns/camp-1', {
      method: 'DELETE',
    });
  });
});
