
import {StyleSheet} from 'react-native';

// =====================================================
// GO4RYDE — MY BOOKINGS LIGHT THEME
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

const SUCCESS = '#2E7D5B';
const SUCCESS_BG = '#EAF6F0';

const WARNING = '#B7791F';
const WARNING_BG = '#FFF7E6';

const DANGER = '#C94B4B';
const DANGER_BG = '#FDECEC';

const INFO_BG = '#EDF4F6';

const styles = StyleSheet.create({

  // =====================================================
  // MAIN
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    minHeight: 100,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingTop: 16,
    marginBottom: 14,
  },

  eyebrow: {
    color: PRIMARY_LIGHT,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  title: {
    color: TEXT,
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    color: SECONDARY,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 5,
    maxWidth: 280,
  },

  headerBadge: {
    minWidth: 42,
    height: 42,

    paddingHorizontal: 10,

    borderRadius: 21,

    backgroundColor: PRIMARY,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: PRIMARY,
    shadowOpacity: 0.15,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  // =====================================================
  // LOADING
  // =====================================================

  loadingContainer: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 70,
    height: 70,

    borderRadius: 35,

    backgroundColor: SURFACE,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 18,

    borderWidth: 1,
    borderColor: BORDER,

    elevation: 2,
  },

  loadingIconText: {
    fontSize: 30,
  },

  loadingTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },

  loadingSubtitle: {
    color: MUTED,
    fontSize: 13,
    marginTop: 5,
  },

  // =====================================================
  // ERROR
  // =====================================================

  errorCard: {
    flexDirection: 'row',

    backgroundColor: SURFACE,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#F1D2D2',

    padding: 16,

    marginTop: 8,
    marginBottom: 16,
  },

  errorIcon: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: DANGER_BG,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  errorIconText: {
    color: DANGER,
    fontSize: 20,
    fontWeight: '900',
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },

  errorText: {
    color: SECONDARY,
    fontSize: 13,
    marginTop: 4,
  },

  retryText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },

  // =====================================================
  // EMPTY
  // =====================================================

  emptyCard: {
    backgroundColor: SURFACE,

    borderRadius: 22,

    borderWidth: 1,
    borderColor: BORDER,

    padding: 28,

    marginTop: 8,

    alignItems: 'center',

    shadowColor: '#1E293B',
    shadowOpacity: 0.05,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  emptyIcon: {
    width: 72,
    height: 72,

    borderRadius: 36,

    backgroundColor: INFO_BG,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 16,
  },

  emptyIconText: {
    fontSize: 32,
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 19,
    fontWeight: '900',
  },

  emptySubtitle: {
    color: SECONDARY,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 280,
  },

  emptyButton: {
    minWidth: 170,
    height: 48,

    borderRadius: 15,

    backgroundColor: PRIMARY,

    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 20,

    paddingHorizontal: 20,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  emptyButtonArrow: {
    color: '#FFFFFF',
    fontSize: 19,
    marginLeft: 8,
  },

  // =====================================================
  // BOOKING CARD
  // =====================================================

  bookingCard: {
    backgroundColor: SURFACE,

    borderRadius: 22,

    borderWidth: 1,
    borderColor: BORDER,

    padding: 18,

    marginTop: 14,

    shadowColor: '#1E293B',
    shadowOpacity: 0.05,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  // =====================================================
  // CARD TOP
  // =====================================================

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rideIcon: {
    width: 46,
    height: 46,

    borderRadius: 15,

    backgroundColor: INFO_BG,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  rideIconText: {
    fontSize: 23,
  },

  rideInfo: {
    flex: 1,
    paddingRight: 8,
  },

  rideTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },

  bookingId: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  // =====================================================
  // STATUS BADGE
  // =====================================================

  statusBadge: {
    minWidth: 78,
    paddingHorizontal: 9,
    paddingVertical: 7,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: SURFACE_2,
  },

  statusBadgeText: {
    color: SECONDARY,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  statusPending: {
    backgroundColor: WARNING_BG,
  },

  statusConfirmed: {
    backgroundColor: SUCCESS_BG,
  },

  statusActive: {
    backgroundColor: INFO_BG,
  },

  statusCompleted: {
    backgroundColor: SUCCESS_BG,
  },

  statusCancelled: {
    backgroundColor: DANGER_BG,
  },

  statusDefault: {
    backgroundColor: SURFACE_2,
  },

  statusTextCompleted: {
    color: SUCCESS,
  },

  statusTextCancelled: {
    color: DANGER,
  },

  // =====================================================
  // DIVIDER
  // =====================================================

  cardDivider: {
    height: 1,

    backgroundColor: BORDER,

    marginVertical: 16,
  },

  // =====================================================
  // DETAILS
  // =====================================================

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailItem: {
    flex: 1,
  },

  detailDivider: {
    width: 1,
    height: 34,
    backgroundColor: BORDER,
    marginHorizontal: 14,
  },

  detailLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  detailValue: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 5,
  },

  // =====================================================
  // INFO MESSAGE
  // =====================================================

  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: INFO_BG,

    borderRadius: 14,

    paddingHorizontal: 13,
    paddingVertical: 12,

    marginTop: 15,
  },

  infoMessageIcon: {
    fontSize: 17,
    marginRight: 9,
  },

  infoMessageText: {
    flex: 1,

    color: PRIMARY,

    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  // =====================================================
  // PAYMENT WARNING
  // =====================================================

  paymentWarning: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: WARNING_BG,

    borderRadius: 14,

    paddingHorizontal: 13,
    paddingVertical: 12,

    marginTop: 15,
  },

  paymentWarningIcon: {
    width: 23,
    height: 23,

    borderRadius: 12,

    backgroundColor: '#F2D79B',

    color: WARNING,

    textAlign: 'center',
    lineHeight: 23,

    fontSize: 13,
    fontWeight: '900',

    marginRight: 9,
  },

  paymentWarningText: {
    flex: 1,

    color: WARNING,

    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  // =====================================================
  // ACTIVE MESSAGE
  // =====================================================

  activeMessage: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: INFO_BG,

    borderRadius: 14,

    paddingHorizontal: 13,
    paddingVertical: 12,

    marginTop: 15,
  },

  activeMessageIcon: {
    color: PRIMARY_LIGHT,
    fontSize: 13,
    marginRight: 9,
  },

  activeMessageText: {
    flex: 1,

    color: PRIMARY,

    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  // =====================================================
  // COMPLETED
  // =====================================================

  completedMessage: {
    backgroundColor: SUCCESS_BG,

    borderRadius: 14,

    paddingHorizontal: 13,
    paddingVertical: 12,

    marginTop: 15,
  },

  completedMessageText: {
    color: SUCCESS,
    fontSize: 12,
    fontWeight: '800',
  },

  // =====================================================
  // ACTIONS
  // =====================================================

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,

    marginTop: 16,
  },

  payButton: {
    flex: 1,

    minWidth: 120,
    height: 46,

    borderRadius: 14,

    backgroundColor: PRIMARY,

    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 14,

    shadowColor: PRIMARY,
    shadowOpacity: 0.15,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  payButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  actionArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 7,
  },

  secondaryButton: {
    minWidth: 82,
    height: 44,

    borderRadius: 13,

    backgroundColor: SURFACE_2,

    borderWidth: 1,
    borderColor: BORDER,

    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 12,
  },

  secondaryIcon: {
    fontSize: 15,
    marginRight: 5,
  },

  secondaryButtonText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
  },

  // =====================================================
  // CANCEL
  // =====================================================

  cancelButton: {
    height: 42,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 5,
  },

  cancelText: {
    color: DANGER,
    fontSize: 12,
    fontWeight: '800',
  },

  // =====================================================
  // FOOTER
  // =====================================================

  footer: {
    color: MUTED,

    fontSize: 11,
    fontWeight: '600',

    textAlign: 'center',

    marginTop: 30,
    marginBottom: 10,
  },
});

export default styles;
