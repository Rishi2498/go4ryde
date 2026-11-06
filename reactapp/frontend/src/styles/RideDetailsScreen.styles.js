
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  // =====================================================
  // COMMON
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    marginBottom: 24,
    width: '100%',
  },

  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    minWidth: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  backButtonSmall: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  backButtonSmallText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#64748B',
    marginBottom: 8,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 32,
    flexShrink: 1,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 19,
  },

  routeArrow: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
    marginVertical: 4,
  },

  // =====================================================
  // GENERIC CARD
  // =====================================================

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },

  cardLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#64748B',
    marginBottom: 14,
  },

  // =====================================================
  // DRIVER CARD
  // =====================================================

  driverCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  driverAvatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },

  driverInfo: {
    flex: 1,
    minWidth: 0,
  },

  driverLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#64748B',
    marginBottom: 3,
  },

  driverName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    flexShrink: 1,
  },

  driverDate: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    flexShrink: 1,
  },

  // =====================================================
  // ROUTE MAP
  // =====================================================

  routeMap: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },

  // =====================================================
  // ROUTE LOCATIONS
  // =====================================================

  routeLocationContainer: {
    width: '100%',
    gap: 14,
  },

  locationBlock: {
    width: '100%',
    minWidth: 0,
  },

  locationLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#64748B',
    marginBottom: 5,
  },

  location: {
    width: '100%',
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 21,
    flexShrink: 1,
  },

  // =====================================================
  // RIDE INFORMATION
  // =====================================================

  section: {
    width: '100%',
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },

  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },

  infoRow: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },

  infoRowLabel: {
    width: '34%',
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    lineHeight: 18,
  },

  infoRowValue: {
    width: '63%',
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'right',
    lineHeight: 19,
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },

  // =====================================================
  // PASSENGER INFO GRID
  // =====================================================

  infoGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  infoBox: {
    width: '48%',
    minHeight: 78,
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  infoGridLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    color: '#64748B',
    marginBottom: 5,
  },

  infoGridValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    flexShrink: 1,
  },

  // =====================================================
  // PASSENGER BOOKING
  // =====================================================

  bookingRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bookingTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },

  bookingSubtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  bookingCount: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
    paddingTop: 12,
  },

  // =====================================================
  // PRICE
  // =====================================================

  priceCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#94A3B8',
    marginBottom: 5,
  },

  priceSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    flexShrink: 1,
  },

  totalPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 12,
  },

  confirmButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  confirmButtonArrow: {
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  // =====================================================
  // DRIVER PASSENGER REQUESTS
  // =====================================================

  passengerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },

  passengerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  passengerInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  passengerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    flexShrink: 1,
  },

  passengerSeats: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 5,
  },

  paymentText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },

  statusBadge: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563EB',
  },

  contactBox: {
    width: '100%',
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },

  contactText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 5,
    flexShrink: 1,
  },

  messageText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 19,
  },

  actionContainer: {
    width: '100%',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  actionHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
  },

  actionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },

  acceptButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  rejectButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  rejectButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.55,
  },

  disabledRejectButton: {
    opacity: 0.55,
  },

  successText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },

  chatButton: {
    width: '100%',
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  startRideButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  startRideButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  endRideButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  endRideButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  // =====================================================
  // COMPLETED PASSENGERS
  // =====================================================

  completedCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  completedLeft: {
    flex: 1,
    minWidth: 0,
  },

  completedName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    flexShrink: 1,
  },

  completedStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },

  completedRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
    flexShrink: 0,
  },

  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 3,
  },

  amountValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },

  // =====================================================
  // EMPTY / ERROR
  // =====================================================

  emptyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 5,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
});

export default styles;