import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7F8',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#66757E',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7ECEF',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3F5',
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: '#16384A',
    marginTop: -2,
  },

  headerTextWrap: {
    marginLeft: 14,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#71818A',
  },

  title: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: '800',
    color: '#16384A',
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  errorBox: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#F1C5C1',
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9B3D35',
  },

  retryText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#16384A',
  },

  balanceCard: {
    padding: 22,
    borderRadius: 22,
    backgroundColor: '#16384A',
    marginBottom: 16,
  },

  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#B7C8D0',
  },

  balanceTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  walletIconText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16384A',
  },

  balanceAmount: {
    marginTop: 28,
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  balanceDescription: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#C5D2D8',
  },

  card: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAED',
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#71818A',
  },

  sectionTitle: {
    marginTop: 5,
    fontSize: 19,
    fontWeight: '800',
    color: '#16384A',
  },

  sectionDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: '#71818A',
  },

  quickAmounts: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 8,
  },

  amountButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F4F5',
    borderWidth: 1,
    borderColor: '#DCE3E7',
  },

  amountButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16384A',
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFA',
    borderWidth: 1,
    borderColor: '#DCE3E7',
  },

  inputPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16384A',
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#16384A',
    paddingVertical: 10,
  },

  primaryButton: {
    minHeight: 52,
    marginTop: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16384A',
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  disabledButton: {
    opacity: 0.55,
  },

  withdrawInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F5F7F8',
  },

  withdrawInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71818A',
  },

  withdrawInfoAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#16384A',
  },

  secondaryButton: {
    minHeight: 52,
    marginTop: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#16384A',
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16384A',
  },

  disabledSecondaryButton: {
    opacity: 0.4,
  },

  infoCard: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: '#EDF3F5',
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16384A',
  },

  infoText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#61717A',
  },

  footerText: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 11,
    color: '#94A0A6',
  },

});

export default styles;
