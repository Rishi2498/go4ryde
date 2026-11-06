import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    marginBottom: 20,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },

  backText: {
    color: '#16384A',
    fontSize: 15,
    fontWeight: '800',
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#7A8793',
    marginBottom: 7,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#16384A',
  },

  bookingNumber: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#7A8793',
  },

  // ==========================================
  // STATUS
  // ==========================================

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EAED',
  },

  statusLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#8A98A2',
    marginBottom: 10,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#16384A',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#E8F3ED',
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#397054',
  },

  // ==========================================
  // CARD
  // ==========================================

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EAED',
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#16384A',
    marginBottom: 14,
  },

  // ==========================================
  // ROUTE
  // ==========================================

  routeTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    color: '#1C2E38',
    marginBottom: 16,
  },

  locationBlock: {
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#EAEDEF',
  },

  locationLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#8A98A2',
    marginBottom: 5,
  },

  locationText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#1C2E38',
  },

  // ==========================================
  // DRIVER
  // ==========================================

  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  driverAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EAF1F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  driverAvatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#16384A',
  },

  driverInfo: {
    flex: 1,
  },

  driverName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C2E38',
  },

  driverPhone: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#61717B',
  },

  // ==========================================
  // BOOKING INFO
  // ==========================================

  infoRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A8793',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C2E38',
  },

  divider: {
    height: 1,
    backgroundColor: '#EAEDEF',
  },

  // ==========================================
  // CHAT
  // ==========================================

  chatButton: {
    minHeight: 72,
    backgroundColor: '#16384A',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,

    flexDirection: 'row',
    alignItems: 'center',
  },

  chatIcon: {
    fontSize: 25,
    marginRight: 13,
  },

  chatTextWrap: {
    flex: 1,
  },

  chatTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  chatSubtitle: {
    marginTop: 3,
    color: '#C7D7DE',
    fontSize: 12,
    fontWeight: '600',
  },

  chatArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5DE',
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
  },

  waitingIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  waitingTextWrap: {
    flex: 1,
  },

  waitingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A7020',
  },

  waitingText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#80631D',
  },

  // ==========================================
  // BOTTOM
  // ==========================================

  bottomButton: {
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DDE3E8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  bottomButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16384A',
  },

  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 11,
    color: '#8A98A2',
  },

  // ==========================================
  // ERROR
  // ==========================================

  errorContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16384A',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#61717B',
    textAlign: 'center',
    marginBottom: 20,
  },

  backButton: {
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#16384A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default styles;
