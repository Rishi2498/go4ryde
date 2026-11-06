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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  // =====================================================
  // BACK
  // =====================================================

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,

    backgroundColor: SURFACE,

    justifyContent: 'center',
    alignItems: 'center',

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
  // HEADER
  // =====================================================

  header: {
    alignItems: 'center',
    marginTop: 44,
  },

  iconContainer: {
    width: 78,
    height: 78,
    borderRadius: 39,

    backgroundColor: '#E8EFF2',
    borderWidth: 1,
    borderColor: '#C9D9DF',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 25,

    shadowColor: PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  icon: {
    fontSize: 34,
    fontWeight: '900',
    color: PRIMARY,
  },

  title: {
    color: TEXT,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.7,
    textAlign: 'center',
  },

  subtitle: {
    color: SECONDARY,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
  },

  // =====================================================
  // SUCCESS
  // =====================================================

  successBox: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: SUCCESS_BG,

    borderWidth: 1,
    borderColor: SUCCESS_BORDER,

    borderRadius: 16,

    paddingHorizontal: 16,
    paddingVertical: 14,

    marginTop: 24,
  },

  successIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,

    backgroundColor: '#D5F0E2',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 11,
  },

  successIconText: {
    color: SUCCESS_TEXT,
    fontSize: 15,
    fontWeight: '900',
  },

  successText: {
    flex: 1,
    color: SUCCESS_TEXT,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  // =====================================================
  // ERROR
  // =====================================================

  errorBox: {
    backgroundColor: ERROR_BG,

    borderWidth: 1,
    borderColor: ERROR_BORDER,

    borderRadius: 16,

    paddingHorizontal: 16,
    paddingVertical: 14,

    marginTop: 20,
  },

  errorText: {
    color: ERROR_TEXT,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '600',
  },

  // =====================================================
  // OTP
  // =====================================================

  codeInput: {
    height: 72,

    backgroundColor: SURFACE,

    borderWidth: 1.5,
    borderColor: BORDER,

    borderRadius: 18,

    marginTop: 30,

    paddingHorizontal: 20,

    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 10,

    color: TEXT,

    textAlign: 'center',

    shadowColor: '#1E293B',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 3,
  },

  codeInputFocused: {
    borderColor: BORDER_FOCUS,
    backgroundColor: '#FFFFFF',

    shadowColor: PRIMARY_LIGHT,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,

    elevation: 4,
  },

  // =====================================================
  // VERIFY BUTTON
  // =====================================================

  verifyButton: {
    height: 58,

    borderRadius: 16,

    backgroundColor: PRIMARY,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 18,

    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 5,
  },

  verifyButtonDisabled: {
    opacity: 0.55,
  },

  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // =====================================================
  // RESEND
  // =====================================================

  resendButton: {
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 22,

    minHeight: 44,
    paddingHorizontal: 12,
  },

  resendText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  resendDisabled: {
    color: MUTED,
  },
});

export default styles;