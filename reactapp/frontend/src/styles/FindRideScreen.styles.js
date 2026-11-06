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
const GREEN = '#2E9B63';

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
    marginLeft: 12,
    flex: 1,
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
  // SECTION CARD
  // =====================================================

  sectionCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginTop: 14,
  },

  sectionLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },

  // =====================================================
  // DATE
  // =====================================================

  dateButton: {
    minHeight: 55,
    backgroundColor: SURFACE_2,
    borderRadius: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },

  dateSubtitle: {
    color: SECONDARY,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },

  dateArrow: {
    color: PRIMARY,
    fontSize: 25,
    fontWeight: '400',
  },

  // =====================================================
  // PASSENGERS
  // =====================================================

  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  passengerTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },

  passengerSubtitle: {
    color: SECONDARY,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },

  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterButtonText: {
    color: PRIMARY,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 23,
  },

  counterDisabled: {
    color: MUTED,
  },

  passengerCount: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
    minWidth: 38,
    textAlign: 'center',
  },

  // =====================================================
  // RIDE TYPE
  // =====================================================

  rideTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },

  rideTypeButton: {
    flex: 1,
    height: 43,
    borderRadius: 12,
    backgroundColor: SURFACE_2,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rideTypeButtonActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  rideTypeText: {
    color: SECONDARY,
    fontSize: 12,
    fontWeight: '800',
  },

  rideTypeTextActive: {
    color: WHITE,
  },

  // =====================================================
  // SEARCH BUTTON
  // =====================================================

  searchButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchButtonDisabled: {
    opacity: 0.65,
  },

  searchButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '900',
  },

  searchButtonArrow: {
    color: WHITE,
    fontSize: 20,
    marginLeft: 9,
    fontWeight: '500',
  },

  // =====================================================
  // PAST SEARCHES
  // =====================================================

  pastSearchesSection: {
    marginTop: 27,
  },

  pastSearchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  pastSearchesTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
  },

  pastSearchesSubtitle: {
    color: SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },

  pastSearchesCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY_LIGHT,
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: 6,
  },

  // =====================================================
  // PAST SEARCH CARD
  // =====================================================

  pastSearchCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 11,
  },

  pastRouteContainer: {
    flexDirection: 'row',
    minHeight: 105,
  },

  pastRouteColumn: {
    width: 20,
    alignItems: 'center',
    paddingTop: 4,
  },

  pastSourceDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    borderWidth: 3,
    borderColor: PRIMARY_LIGHT,
  },

  pastRouteLine: {
    width: 1,
    height: 48,
    backgroundColor: BORDER,
    marginVertical: 2,
  },

  pastDestinationDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: SURFACE,
    borderWidth: 2.5,
    borderColor: PRIMARY,
  },

  pastLocations: {
    flex: 1,
    marginLeft: 11,
  },

  pastLocationBlock: {
    flex: 1,
  },

  pastLocationLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
    marginBottom: 3,
  },

  pastLocationText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    paddingRight: 5,
  },

  pastRouteGap: {
    height: 17,
  },

  pastSearchArrowContainer: {
    width: 26,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  pastSearchArrow: {
    color: PRIMARY,
    fontSize: 28,
    fontWeight: '400',
  },
};  