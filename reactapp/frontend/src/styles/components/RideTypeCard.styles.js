import {StyleSheet} from 'react-native';

// =====================================================
// GO4RYDE LIGHT THEME
// =====================================================

const BG = '#F4F6F8';
const SURFACE = '#FFFFFF';
const SURFACE_2 = '#F5F7F8';

const BORDER = '#E5EAED';

const TEXT = '#1C2E38';
const SECONDARY = '#61717B';
const MUTED = '#8A98A2';

const PRIMARY = '#16384A';
const PRIMARY_LIGHT = '#5E8FA3';

const styles = StyleSheet.create({

  // =====================================================
  // CARD
  // =====================================================

  card: {
    flex: 1,

    minHeight: 174,

    backgroundColor: SURFACE,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 20,

    padding: 16,

    shadowColor: '#1E293B',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.06,

    shadowRadius: 14,

    elevation: 3,
  },


  // =====================================================
  // TOP
  // =====================================================

  topRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 17,
  },


  // =====================================================
  // ICON
  // =====================================================

  iconContainer: {
    width: 48,
    height: 48,

    borderRadius: 15,

    backgroundColor: '#EDF4F6',

    borderWidth: 1,
    borderColor: '#D7E5EA',

    justifyContent: 'center',

    alignItems: 'center',
  },

  icon: {
    fontSize: 22,
  },


  // =====================================================
  // ARROW
  // =====================================================

  arrowContainer: {
    width: 30,
    height: 30,

    borderRadius: 10,

    backgroundColor: SURFACE_2,

    borderWidth: 1,
    borderColor: BORDER,

    justifyContent: 'center',

    alignItems: 'center',
  },

  arrow: {
    color: PRIMARY,

    fontSize: 15,

    fontWeight: '700',
  },


  // =====================================================
  // TITLE
  // =====================================================

  title: {
    color: TEXT,

    fontSize: 17,

    fontWeight: '900',

    letterSpacing: -0.2,

    marginBottom: 5,
  },


  // =====================================================
  // DESCRIPTION
  // =====================================================

  description: {
    color: SECONDARY,

    fontSize: 11,

    lineHeight: 16,

    fontWeight: '500',

    minHeight: 32,
  },


  // =====================================================
  // ACTION
  // =====================================================

  actionRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 14,

    paddingTop: 11,

    borderTopWidth: 1,

    borderTopColor: BORDER,
  },

  actionText: {
    flex: 1,

    color: PRIMARY,

    fontSize: 10,

    fontWeight: '800',

    letterSpacing: 0.2,
  },

  actionArrow: {
    color: PRIMARY,

    fontSize: 15,

    fontWeight: '600',
  },

});

export default styles;