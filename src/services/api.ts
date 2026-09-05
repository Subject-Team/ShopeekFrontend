// Facade over the domain-split API modules. Every public name from the former
// single-file client is re-exported here with identical names and signatures so
// importers keep using `.../services/api` unchanged.
export { getWebSessionId, setWebSessionId, refreshAccessToken } from './api/client';
export {
  loginApi,
  fetchMeApi,
  sendOtpApi,
  verifyOtpApi,
  registerWithPhoneApi,
  changePassword,
} from './api/auth';
export { fetchKPISummary, fetchRevenueTrend } from './api/analytics';
export {
  fetchCustomers,
  fetchCustomerDetail,
  addCustomerInteraction,
  createCustomer,
} from './api/customers';
export {
  fetchLatestAdvisory,
  fetchAdvisoryHistory,
  triggerManualAdvisory,
} from './api/advisory';
export { uploadSalesFile, previewSalesFile, getSampleCSV } from './api/ingestion';
export { sendChatMessage, fetchChatHistory, clearChatHistory } from './api/chat';
export { fetchSalesSuggestions, createInvoice } from './api/sales';
export {
  fetchSettings,
  revokeWebSession,
  revokeAllOtherSessions,
  unlinkTelegramSession,
} from './api/settings';