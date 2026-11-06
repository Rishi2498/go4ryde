import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // =========================================================
  // HEADER
  // =========================================================

  header: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#6366F1',
    marginBottom: 5,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },

  // =========================================================
  // SUMMARY
  // =========================================================

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  amountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
  },

  // =========================================================
  // SECTION
  // =========================================================

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },

  // =========================================================
  // PAYMENT METHODS
  // =========================================================

  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
  },

  methodCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#F5F3FF',
  },

  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },

  methodIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4F46E5',
  },

  methodContent: {
    flex: 1,
    marginLeft: 13,
    marginRight: 10,
  },

  methodTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 3,
  },

  methodSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioOuterSelected: {
    borderColor: '#6366F1',
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#6366F1',
  },

  // =========================================================
  // PARTIAL PAYMENT
  // =========================================================

  partialBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 8,
  },

  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
  },

  currencySymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginRight: 7,
  },

  amountInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  inputHint: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
  },

  // =========================================================
  // INFO
  // =========================================================

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 15,
    padding: 15,
    marginTop: 12,
    marginBottom: 18,
  },

  infoIcon: {
    fontSize: 20,
    color: '#2563EB',
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#374151',
  },

  // =========================================================
  // PAY BUTTON
  // =========================================================

  payButton: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },

  payButtonDisabled: {
    opacity: 0.65,
  },

  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 8,
  },

  // =========================================================
  // SECURITY
  // =========================================================

  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },

  securityIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  securityText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
  },
});

export default styles;