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
};

const styles = StyleSheet.create({

  // =====================================================
  // MAIN
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 50,
  },


  // =====================================================
  // HEADER
  // =====================================================

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
    paddingRight: 14,
    minWidth: 0,
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

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#16384A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 3,
  },

  profileButtonText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: '800',
  },


  // =====================================================
  // QUICK ACTIONS
  // =====================================================

  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: colors.surface,

    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,

    paddingVertical: 12,
    paddingHorizontal: 8,

    marginBottom: 28,

    shadowColor: '#16384A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 2,
  },

  quickItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',

    minWidth: 0,
    paddingHorizontal: 5,
  },

  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,

    backgroundColor: '#EAF1F5',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 9,
  },

  quickIconText: {
    fontSize: 17,
  },

  quickText: {
    flex: 1,
    minWidth: 0,
  },

  quickTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: colors.text,
  },

  quickSubtitle: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 13,
    color: colors.textMuted,
  },

  quickDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.divider,
  },


  // =====================================================
  // SECTION HEADER
  // =====================================================

  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  sectionTitleWrap: {
    flex: 1,
    paddingRight: 10,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    color: colors.primary,
  },

  sectionSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  badge: {
    minHeight: 30,

    paddingHorizontal: 10,

    borderRadius: 10,

    borderWidth: 1,
    borderColor: colors.borderStrong,

    backgroundColor: colors.surfaceSoft,

    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: 12,
  },

  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.primary,
  },


  // =====================================================
  // YOUR JOURNEY
  // =====================================================

  sectionCard: {
    backgroundColor: colors.surface,

    borderRadius: 18,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: colors.border,

    overflow: 'hidden',
  },

  menuRow: {
    minHeight: 72,

    paddingHorizontal: 18,
    paddingVertical: 14,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F3',
  },

  menuRowLast: {
    borderBottomWidth: 0,
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
    minWidth: 0,
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


  // =====================================================
  // TRUST CARD
  // =====================================================

  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: colors.successBackground,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: '#D7E9DF',

    padding: 14,

    marginBottom: 24,
  },

  trustIcon: {
    width: 38,
    height: 38,

    borderRadius: 11,

    backgroundColor: colors.surface,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 11,
  },

  trustIconText: {
    fontSize: 17,
    color: colors.successText,
    fontWeight: '800',
  },

  trustContent: {
    flex: 1,
    minWidth: 0,
  },

  trustTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: colors.successText,
  },

  trustSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#557765',
  },


  // =====================================================
  // FOOTER
  // =====================================================

  footerText: {
    marginTop: 8,
    marginBottom: 10,

    textAlign: 'center',

    fontSize: 11,
    lineHeight: 16,

    color: colors.textMuted,
  },
});

export default styles;
