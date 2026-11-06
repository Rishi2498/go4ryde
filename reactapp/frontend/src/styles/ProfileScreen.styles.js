import {StyleSheet} from 'react-native';

const colors = {
  background: '#F6F8FA',
  surface: '#FFFFFF',
  surfaceSoft: '#F5F7F8',
  primary: '#16384A',
  primaryLight: '#5E8FA3',
  text: '#1C2E38',
  textSecondary: '#61717B',
  textMuted: '#8A98A2',
  border: '#E5EAED',
  borderStrong: '#DDE3E8',
  divider: '#EAEDEF',
  successBackground: '#E8F3ED',
  successText: '#397054',
  warningBackground: '#FFF5DE',
  warningText: '#9A7020',
  dangerBackground: '#FEECEC',
  dangerBorder: '#F5B5B5',
  dangerText: '#C62828',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 50,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  header: {
    marginTop: 10,
    marginBottom: 24,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#7A8793',
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.primary,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  editHeaderButton: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: '#16384A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatarText: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: '800',
  },

  username: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 5,
    textAlign: 'center',
  },

  email: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 5,
    textAlign: 'center',
  },

  phone: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  roleBadge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EAF1F5',
  },

  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.primary,
  },

  driverRoleBadge: {
    backgroundColor: '#EAF1F5',
  },

  driverRoleBadgeText: {
    color: colors.primary,
  },

  errorBox: {
    backgroundColor: colors.dangerBackground,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  errorText: {
    color: colors.dangerText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },

  retryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },

  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: colors.primary,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },

  menuRow: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F3',
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EAF1F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  menuIconText: {
    fontSize: 18,
  },

  menuTextWrap: {
    flex: 1,
    paddingRight: 12,
  },

  menuTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.text,
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#7A8793',
  },

  chevron: {
    fontSize: 28,
    lineHeight: 30,
    color: '#9AA5AE',
    fontWeight: '300',
  },

  verificationBox: {
    margin: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
  },

  verificationLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.textMuted,
  },

  verificationText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: '#4B5563',
  },

  documentStatusText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  documentUploaded: {
    color: colors.successText,
  },

  documentMissing: {
    color: colors.warningText,
  },

  logoutButton: {
    minHeight: 50,
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,

    shadowColor: '#16384A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },

  logoutText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },

  footerText: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },
});

export default styles;