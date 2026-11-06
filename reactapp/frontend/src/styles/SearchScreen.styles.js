const BG = '#F4F6F8';
const SURFACE = '#FFFFFF';
const SURFACE_2 = '#F5F7F8';
const BORDER = '#E5EAED';
const TEXT = '#1C2E38';
const SECONDARY = '#61717B';
const MUTED = '#8A98A2';
const PRIMARY = '#16384A';
const PRIMARY_LIGHT = '#EAF1F4';
const WHITE = '#FFFFFF';

export default {
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 35,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    color: PRIMARY,
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 32,
    marginTop: -2,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    color: TEXT,
    fontSize: 23,
    fontWeight: '900',
  },

  subtitle: {
    color: SECONDARY,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },

  // =====================================================
  // SEARCH SUMMARY
  // =====================================================

  searchSummary: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 22,
  },

  summaryLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 13,
  },

  summaryRoute: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    borderWidth: 3,
    borderColor: PRIMARY_LIGHT,
    marginRight: 11,
  },

  summaryDestinationDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: SURFACE,
    borderWidth: 2.5,
    borderColor: PRIMARY,
    marginRight: 11,
  },

  summaryLocation: {
    flex: 1,
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  summaryLine: {
    width: 1,
    height: 20,
    backgroundColor: BORDER,
    marginLeft: 5,
    marginVertical: 3,
  },

  summaryDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  summaryDetail: {
    color: SECONDARY,
    fontSize: 10,
    fontWeight: '700',
  },

  summarySeparator: {
    color: MUTED,
    fontSize: 10,
    marginHorizontal: 7,
  },

  // =====================================================
  // RESULTS
  // =====================================================

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  resultsTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
  },

  resultsCount: {
    color: SECONDARY,
    fontSize: 11,
    fontWeight: '700',
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
  },

  loadingText: {
    color: SECONDARY,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
  },

  // =====================================================
  // RIDE CARD
  // =====================================================

  rideCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 17,
    marginBottom: 14,

    shadowColor: '#1C2E38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: '#D7E2E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  driverAvatarText: {
    color: PRIMARY,
    fontSize: 17,
    fontWeight: '900',
  },

  driverInfo: {
    flex: 1,
    marginLeft: 11,
  },

  driverName: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },

  rideDate: {
    color: SECONDARY,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },

  priceContainer: {
    alignItems: 'flex-end',
  },

  priceLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  ridePrice: {
    color: PRIMARY,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 1,
  },

  perSeat: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '600',
  },

  // =====================================================
  // ROUTE
  // =====================================================

  routeContainer: {
    flexDirection: 'row',
    marginTop: 18,
  },

  routeDots: {
    width: 20,
    alignItems: 'center',
    paddingTop: 4,
  },

  sourceDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    borderWidth: 3,
    borderColor: PRIMARY_LIGHT,
  },

  routeLine: {
    width: 1,
    height: 38,
    backgroundColor: BORDER,
    marginVertical: 3,
  },

  destinationDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: SURFACE,
    borderWidth: 2.5,
    borderColor: PRIMARY,
  },

  locations: {
    flex: 1,
    marginLeft: 11,
  },

  locationLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  location: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  routeGap: {
    height: 17,
  },

  // =====================================================
  // RIDE INFO
  // =====================================================

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  infoValue: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },

  // =====================================================
  // BOOK
  // =====================================================

  bookButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  bookButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '900',
  },

  // =====================================================
  // EMPTY
  // =====================================================

  emptyContainer: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 22,
  },

  emptyIcon: {
    color: MUTED,
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 8,
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
  },

  emptyText: {
    color: SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 6,
  },

  changeSearchButton: {
    height: 43,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
  },

  changeSearchButtonText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '900',
  },
};