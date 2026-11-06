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

const ORIGIN = '#287A4A';
const DESTINATION = '#3B82A0';

const styles = StyleSheet.create({

  // =====================================================
  // MAIN CARD
  // =====================================================

  card: {
    backgroundColor: SURFACE,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 22,

    padding: 16,

    shadowColor: '#1E293B',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.06,

    shadowRadius: 18,

    elevation: 3,
  },


  // =====================================================
  // LOCATION ROW
  // =====================================================

  locationRow: {
    minHeight: 58,

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: SURFACE_2,

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: 16,

    paddingHorizontal: 13,
  },


  // =====================================================
  // LOCATION ICON
  // =====================================================

  iconContainer: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: '#EDF4F6',

    borderWidth: 1,
    borderColor: '#D7E5EA',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  originDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: ORIGIN,

    borderWidth: 2,
    borderColor: '#A9D8BD',

    shadowColor: ORIGIN,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.25,

    shadowRadius: 5,

    elevation: 2,
  },

  destinationDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: DESTINATION,

    borderWidth: 2,
    borderColor: '#B9DDE8',

    shadowColor: DESTINATION,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.2,

    shadowRadius: 5,

    elevation: 2,
  },


  // =====================================================
  // LOCATION CONTENT
  // =====================================================

  locationContent: {
    flex: 1,
  },

  label: {
    color: MUTED,

    fontSize: 9,

    fontWeight: '900',

    letterSpacing: 1.3,

    marginBottom: 4,
  },

  value: {
    color: TEXT,

    fontSize: 14,

    fontWeight: '700',
  },

  locationArrow: {
    color: MUTED,

    fontSize: 24,

    fontWeight: '300',

    marginLeft: 8,
  },


  // =====================================================
  // ROUTE
  // =====================================================

  routeContainer: {
    height: 18,

    justifyContent: 'center',

    paddingLeft: 31,
  },

  routeLine: {
    width: 2,

    height: 18,

    backgroundColor: BORDER,
  },


  // =====================================================
  // OPTIONS
  // =====================================================

  options: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 14,

    padding: 5,

    backgroundColor: SURFACE_2,

    borderWidth: 1,

    borderColor: BORDER,

    borderRadius: 16,
  },


  // =====================================================
  // OPTION
  // =====================================================

  option: {
    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    paddingVertical: 8,

    paddingHorizontal: 8,
  },

  optionIconContainer: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: '#EDF4F6',

    borderWidth: 1,

    borderColor: '#D7E5EA',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 8,
  },

  optionIcon: {
    fontSize: 14,
  },

  optionContent: {
    flex: 1,
  },

  optionLabel: {
    color: MUTED,

    fontSize: 8,

    fontWeight: '900',

    letterSpacing: 1,

    marginBottom: 3,
  },

  optionValue: {
    color: TEXT,

    fontSize: 11,

    fontWeight: '700',
  },


  // =====================================================
  // DIVIDER
  // =====================================================

  divider: {
    width: 1,

    height: 32,

    backgroundColor: BORDER,
  },


  // =====================================================
  // BUTTON
  // =====================================================

  button: {
    height: 52,

    marginTop: 14,

    borderRadius: 15,

    backgroundColor: PRIMARY,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: PRIMARY,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.18,

    shadowRadius: 10,

    elevation: 5,
  },

  buttonText: {
    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '800',
  },

  buttonArrow: {
    color: '#FFFFFF',

    fontSize: 19,

    marginLeft: 10,

    fontWeight: '400',
  },

});

export default styles;