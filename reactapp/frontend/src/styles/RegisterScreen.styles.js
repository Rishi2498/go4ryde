import {StyleSheet} from 'react-native';

const BG = '#F4F6F8';
const SURFACE = '#FFFFFF';
const SURFACE_2 = '#F5F7F8';

const BORDER = '#E1E7EA';
const BORDER_FOCUS = '#5E8FA3';

const TEXT = '#1C2E38';
const SECONDARY = '#61717B';
const MUTED = '#8A98A2';

const PRIMARY = '#16384A';
const PRIMARY_LIGHT = '#5E8FA3';

const SUCCESS_BG = '#EAF6F0';
const SUCCESS_BORDER = '#B9E2CF';
const SUCCESS_TEXT = '#247A52';

const ERROR_BG = '#FDEEEF';
const ERROR_BORDER = '#F3C5C9';
const ERROR_TEXT = '#C53B45';

const styles = StyleSheet.create({
  // =====================================================
  // MAIN
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30,
  },

  // =====================================================
  // BACK BUTTON
  // =====================================================

  backButton: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: SURFACE,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 28,

    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  backIcon: {
    color: PRIMARY,
    fontSize: 30,
    fontWeight: '400',
    marginTop: -3,
  },

  // =====================================================
  // BRAND
  // =====================================================

  brand: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logoText: {
    color: PRIMARY,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  logoAccent: {
    color: PRIMARY_LIGHT,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    marginBottom: 28,
  },

  eyebrow: {
    color: PRIMARY_LIGHT,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },

  title: {
    color: TEXT,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  subtitle: {
    color: SECONDARY,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    maxWidth: 330,
  },

  // =====================================================
  // FORM CARD
  // =====================================================

  form: {
    backgroundColor: SURFACE,

    borderRadius: 22,

    padding: 20,

    shadowColor: '#1E293B',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 9,
  },

  input: {
    height: 56,

    backgroundColor: SURFACE_2,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 14,

    paddingHorizontal: 16,

    fontSize: 15,
    fontWeight: '600',

    color: TEXT,
  },

  inputFocused: {
    borderColor: BORDER_FOCUS,

    backgroundColor: '#FFFFFF',

    shadowColor: PRIMARY_LIGHT,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 2,
  },

  // =====================================================
  // CREATE ACCOUNT BUTTON
  // =====================================================

  createButton: {
    height: 58,

    borderRadius: 16,

    backgroundColor: PRIMARY,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 5,

    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 5,
  },

  createButtonDisabled: {
    opacity: 0.55,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // =====================================================
  // SUCCESS MESSAGE
  // =====================================================

  successBox: {
    backgroundColor: SUCCESS_BG,

    borderWidth: 1,
    borderColor: SUCCESS_BORDER,

    borderRadius: 15,

    padding: 14,

    marginBottom: 18,
  },

  successText: {
    color: SUCCESS_TEXT,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  errorBox: {
    backgroundColor: ERROR_BG,

    borderWidth: 1,
    borderColor: ERROR_BORDER,

    borderRadius: 15,

    padding: 14,

    marginBottom: 18,
  },

  errorText: {
    color: ERROR_TEXT,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  // =====================================================
  // LOGIN
  // =====================================================

  loginContainer: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    paddingTop: 35,
    paddingBottom: 10,
  },

  loginText: {
    color: SECONDARY,
    fontSize: 14,
  },

  loginLink: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 5,
  },
});

export default styles;