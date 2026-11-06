import {StyleSheet} from 'react-native';

// =====================================================
// GO4RYDE LIGHT THEME
// =====================================================

const SURFACE_2 = '#F5F7F8';
const BORDER = '#E5EAED';

const TEXT = '#1C2E38';
const SECONDARY = '#61717B';
const MUTED = '#8A98A2';

const PRIMARY = '#16384A';

const styles = StyleSheet.create({

  // =====================================================
  // ROW
  // =====================================================

  container: {
    minHeight: 76,

    flexDirection: 'row',

    alignItems: 'center',

    paddingVertical: 12,
  },


  // =====================================================
  // ICON CONTAINER
  // =====================================================

  iconContainer: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: '#EDF4F6',

    borderWidth: 1,

    borderColor: '#D7E5EA',

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 13,
  },


  // =====================================================
  // ICON
  // =====================================================

  icon: {
    fontSize: 19,

    textAlign: 'center',
  },


  // =====================================================
  // CONTENT
  // =====================================================

  content: {
    flex: 1,

    justifyContent: 'center',

    paddingRight: 8,
  },


  // =====================================================
  // TITLE
  // =====================================================

  title: {
    color: TEXT,

    fontSize: 13,

    fontWeight: '800',

    letterSpacing: 0.1,

    marginBottom: 4,
  },


  // =====================================================
  // DESCRIPTION
  // =====================================================

  description: {
    color: SECONDARY,

    fontSize: 11,

    lineHeight: 16,

    fontWeight: '500',
  },


  // =====================================================
  // ARROW
  // =====================================================

  arrow: {
    color: MUTED,

    fontSize: 22,

    fontWeight: '300',

    marginLeft: 5,
  },

});

export default styles;