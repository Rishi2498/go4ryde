import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  header: {
    marginBottom: 22,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#64748B',
    marginBottom: 7,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#64748B',
  },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  errorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 12,
  },

  retryButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },

  createButton: {
    minHeight: 46,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  // =====================================================
  // RIDE CARD
  // =====================================================

  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // =====================================================
  // ROUTE
  // =====================================================

  routeSection: {
    marginBottom: 18,
  },

  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  fromDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16A34A',
    marginTop: 5,
    marginRight: 12,
  },

  toDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
    marginTop: 5,
    marginRight: 12,
  },

  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginLeft: 5,
    marginVertical: 2,
  },

  routeTextContainer: {
    flex: 1,
  },

  routeLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#94A3B8',
    marginBottom: 3,
  },

  route: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
    color: '#0F172A',
  },

  // =====================================================
  // STATUS
  // =====================================================

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },

  defaultStatusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },

  activeStatusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
  },

  scheduledStatusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },

  completedStatusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#166534',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },

  // =====================================================
  // RIDE INFO
  // =====================================================

  infoRow: {
    marginBottom: 14,
  },

  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  infoGridItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },

  infoItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },

  // =====================================================
  // DETAILS BUTTON
  // =====================================================

  detailsButton: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  detailsArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 9,
  },
});

export default styles;