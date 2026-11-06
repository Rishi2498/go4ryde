import {StyleSheet} from 'react-native';

// =====================================================
// GO4RYDE LIGHT NAVIGATION THEME
// =====================================================

const BG = '#F4F6F8';

const SURFACE = '#FFFFFF';

const BORDER = '#E5EAED';

const TEXT = '#1C2E38';

const MUTED = '#8A98A2';

const PRIMARY = '#16384A';

const styles = StyleSheet.create({

  // =====================================================
  // BOTTOM TAB BAR
  // =====================================================

  tabBar: {
    backgroundColor: SURFACE,

    borderTopWidth: 1,
    borderTopColor: BORDER,

    height: 68,

    paddingTop: 7,
    paddingBottom: 8,

    elevation: 8,

    shadowColor: TEXT,

    shadowOffset: {
      width: 0,
      height: -3,
    },

    shadowOpacity: 0.08,

    shadowRadius: 10,
  },


  // =====================================================
  // TAB LABEL
  // =====================================================

  tabLabel: {
    fontSize: 10,

    fontWeight: '700',
  },


  // =====================================================
  // STACK CONTENT
  // =====================================================

  stackContent: {
    backgroundColor: BG,
  },


  // =====================================================
  // TAB ICON
  // =====================================================

  tabIcon: {
    fontSize: 18,

    color: MUTED,

    fontWeight: '500',

    lineHeight: 22,
  },


  tabIconActive: {
    fontSize: 21,

    color: PRIMARY,

    fontWeight: '800',

    lineHeight: 22,
  },

});

export default styles;