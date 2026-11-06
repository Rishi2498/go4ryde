import {StyleSheet} from 'react-native';

const BG = '#F4F6F8';
const PRIMARY = '#16384A';
const ACCENT = '#5E8FA3';
const TEXT = '#1C2E38';
const SECONDARY = '#61717B';

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
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 20,
  },

  // =====================================================
  // LOGO
  // =====================================================

  logo: {
    width: 88,
    height: 88,

    borderRadius: 28,

    backgroundColor: PRIMARY,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 22,

    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 6,
  },

  logoText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // =====================================================
  // APP NAME
  // =====================================================

  title: {
    fontSize: 32,
    fontWeight: '900',
    color: PRIMARY,

    letterSpacing: 1,
  },

  // =====================================================
  // SUBTITLE
  // =====================================================

  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SECONDARY,

    marginTop: 8,

    textAlign: 'center',
  },
});

export default styles;