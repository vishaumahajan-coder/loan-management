import api from './api';

class ReferralService {
  /**
   * Generates a referral link for a user
   */
  getReferralLink(referralCode) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  /**
   * Validates a referral code (Optional: can be used during registration)
   */
  async validateReferralCode(code) {
    try {
      const response = await api.get(`/auth/validate-referral?code=${code}`);
      return response.data;
    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Checks if a referral condition is met (Triggered on Backend, but helper for UI)
   */
  async checkQualification(referralId) {
    try {
      const response = await api.post('/referrals/check', { referralId });
      return response.data;
    } catch (error) {
      console.error('Qualification check failed', error);
      return null;
    }
  }

  /**
   * Gets referral stats for a user
   */
  async getReferralStats() {
    try {
      const response = await api.get('/referrals/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch referral stats', error);
      return { totalReferrals: 0, qualifiedReferrals: 0, totalEarned: 0 };
    }
  }
}

export const referralService = new ReferralService();
