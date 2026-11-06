import {StyleSheet} from 'react-native';

// =====================================================
// GO4RYDE LIGHT THEME
// =====================================================

const BG = '#F4F6F8';
const SURFACE = '#FFFFFF';
const BORDER = '#E5EAED';

const TEXT = '#1C2E38';
const SECONDARY = '#61717B';
const MUTED = '#8A98A2';

const PRIMARY = '#16384A';
const PRIMARY_LIGHT = '#5E8FA3';
const GREEN = '#2E9B63';

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // MAIN
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // HEADER
  header: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    color: PRIMARY_LIGHT,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 7,
  },

  title: {
    color: TEXT,
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  unreadText: {
    color: SECONDARY,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 7,
  },

  // MARK ALL READ BUTTON
  markAllButton: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C2E38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  markAllText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '900',
  },

  // LIST
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 40,
    flexGrow: 1,
  },

  // NOTIFICATION CARD
  notificationCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#1C2E38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  unreadCard: {
    borderColor: '#D7E2E7',
    backgroundColor: '#FCFEFF',
  },

  // NOTIFICATION ICON
  iconContainer: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 14,
    backgroundColor: '#EAF1F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  icon: {
    fontSize: 19,
  },

  // CONTENT
  content: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.1,
  },

  unreadDot: {
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: 4,
    backgroundColor: GREEN,
    marginLeft: 8,
  },

  message: {
    color: SECONDARY,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  date: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 8,
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: SECONDARY,
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    paddingBottom: 60,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#EAF1F4',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 30,
    marginBottom: 18,
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  emptyMessage: {
    color: SECONDARY,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    textAlign: 'center',
  },
});

export default styles;
