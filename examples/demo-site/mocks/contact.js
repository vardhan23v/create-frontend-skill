// MOCK: stands in for POST /api/contact (docs/api-contract.md) until the backend exists.
// It never sends anything. main.js shows a banner whenever this is in use.
export function mockSendMessage(payload) {
  console.warn('[mock] contact form submission not sent:', payload);
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true, id: 'mock' }), 600));
}
