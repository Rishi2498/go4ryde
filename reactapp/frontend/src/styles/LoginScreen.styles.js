import {StyleSheet} from 'react-native';

// =====================================================
// GO4RYDE LIGHT THEME
// Matches CreateRideScreen
// =====================================================

const BG = '#F4F6F8';
const SURFACE = '#FFFFFF';
const SURFACE_2 = '#F5F7F8';

const BORDER = '#E5EAED';
const BORDER_FOCUS = '#16384A';

const TEXT = '#1C2E38';
const SECONDARY = '#61717B';
const MUTED = '#8A98A2';

const PRIMARY = '#16384A';
const PRIMARY_LIGHT = '#5E8FA3';

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
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 30,
  },


  // =====================================================
  // BRAND
  // =====================================================

  brand: {
    alignItems: 'center',
    marginBottom: 38,
  },

  logoMark: {
    width: 58,
    height: 32,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 8,
  },

  logoCar: {
    fontSize: 28,
    color: PRIMARY,
    fontWeight: '900',
  },

  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: TEXT,
    letterSpacing: 1.5,
  },

  logoAccent: {
    color: PRIMARY_LIGHT,
  },


  // =====================================================
  // HEADER
  // =====================================================

  header: {
    marginBottom: 34,
  },

  eyebrow: {
    color: PRIMARY_LIGHT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },

  title: {
    color: TEXT,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
    letterSpacing: -1.2,
  },

  subtitle: {
    color: SECONDARY,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    maxWidth: 330,
  },


  // =====================================================
  // FORM
  // =====================================================

  form: {
    marginTop: 4,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 9,
  },

  input: {
    height: 60,

    backgroundColor: SURFACE,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 17,

    paddingHorizontal: 18,

    fontSize: 16,
    color: TEXT,

    shadowColor: '#1E293B',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  inputFocused: {
    borderColor: BORDER_FOCUS,
    borderWidth: 1.5,

    backgroundColor: SURFACE,

    shadowColor: PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },


  // =====================================================
  // LOGIN BUTTON
  // =====================================================

  loginButton: {
    height: 60,

    borderRadius: 17,

    backgroundColor: PRIMARY,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 5,

    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,

    elevation: 5,
  },

  loginButtonDisabled: {
    opacity: 0.55,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },


  // =====================================================
  // SUCCESS
  // =====================================================

  successBox: {
    backgroundColor: '#EAF5EF',

    borderWidth: 1,
    borderColor: '#B9DDC8',

    borderRadius: 15,

    padding: 14,
    marginBottom: 20,
  },

  successText: {
    color: '#287A4A',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },


  // =====================================================
  // ERROR
  // =====================================================

  errorBox: {
    backgroundColor: '#FDEEEF',

    borderWidth: 1,
    borderColor: '#F2C5CA',

    borderRadius: 15,

    padding: 14,
    marginBottom: 20,
  },

  errorText: {
    color: '#B42336',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },


  // =====================================================
  // DIVIDER
  // =====================================================

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },

  dividerText: {
    marginHorizontal: 14,
    color: MUTED,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },


  // =====================================================
  // GOOGLE BUTTON
  // =====================================================

  googleButton: {
    height: 58,

    borderRadius: 17,

    backgroundColor: SURFACE,

    borderWidth: 1,
    borderColor: BORDER,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT,
    marginRight: 10,
  },

  googleText: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
  },


  // =====================================================
  // REGISTER
  // =====================================================

  registerContainer: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 'auto',
    paddingTop: 45,
  },

  registerText: {
    color: SECONDARY,
    fontSize: 14,
  },

  registerLink: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 5,
  },

});

export default styles;