import {StyleSheet} from 'react-native';

const SURFACE = '#FFFFFF';
const BORDER = '#E5EAED';
const TEXT = '#1C2E38';
const SECONDARY = '#61717B';
const MUTED = '#8A98A2';
const PRIMARY = '#16384A';
const PRIMARY_LIGHT = '#EAF1F4';
const GREEN = '#2E9B63';
const RED = '#D95C5C';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  // =====================================================
  // LOCATION FORM
  // =====================================================

  locationCard: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  inputRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
  },

  routeColumn: {
    width: 28,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sourceDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PRIMARY,
    borderWidth: 3,
    borderColor: '#EAF1F4',
  },

  destinationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: SURFACE,
    borderWidth: 3,
    borderColor: PRIMARY,
  },

  routeLine: {
    width: 1,
    flex: 1,
    backgroundColor: BORDER,
    marginVertical: 4,
  },

  inputContent: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 8,
  },

  label: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  textInput: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '700',
    padding: 0,
    margin: 0,
    minHeight: 30,
  },

  mapSmallButton: {
    minWidth: 48,
    height: 36,
    borderRadius: 10,
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: '#D7E2E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  mapSmallButtonText: {
    color: PRIMARY,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // =====================================================
  // SEARCH RESULTS
  // =====================================================

  searchResultsCard: {
    marginTop: 8,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    elevation: 2,
  },

  searchResult: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  searchResultIcon: {
    width: 28,
    color: PRIMARY,
    fontSize: 13,
    textAlign: 'center',
    marginRight: 8,
  },

  searchResultText: {
    flex: 1,
    color: TEXT,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  searchingContainer: {
    marginTop: 8,
    minHeight: 45,
    borderRadius: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchingText: {
    color: SECONDARY,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },

  // =====================================================
  // CURRENT LOCATION
  // =====================================================

  currentLocationButton: {
    minHeight: 62,
    marginTop: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: '#D7E2E7',
    flexDirection: 'row',
    alignItems: 'center',
  },

  currentLocationIcon: {
    color: PRIMARY,
    fontSize: 23,
    fontWeight: '700',
    marginRight: 11,
  },

  currentLocationContent: {
    flex: 1,
  },

  currentLocationText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '800',
  },

  currentLocationSubtext: {
    color: SECONDARY,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },

  // =====================================================
  // SELECT ON MAP
  // =====================================================

  selectMapButton: {
    minHeight: 70,
    marginTop: 10,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectMapIcon: {
    color: PRIMARY,
    fontSize: 28,
    fontWeight: '700',
    marginRight: 12,
  },

  selectMapContent: {
    flex: 1,
  },

  selectMapTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },

  selectMapSubtitle: {
    color: SECONDARY,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },

  selectMapArrow: {
    color: MUTED,
    fontSize: 28,
    fontWeight: '300',
  },

  // =====================================================
  // MAP MODAL
  // =====================================================

  mapModal: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  mapHeader: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: SURFACE,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    elevation: 3,
  },

  mapBackButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  mapBackIcon: {
    color: PRIMARY,
    fontSize: 32,
    fontWeight: '400',
    marginTop: -4,
  },

  mapHeaderTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '900',
  },

  mapHeaderSubtitle: {
    color: SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  fullMap: {
    flex: 1,
  },

  // =====================================================
  // MAP HINT
  // =====================================================

  mapHintContainer: {
    position: 'absolute',
    top: 18,
    left: 20,
    right: 20,
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 4,
  },

  mapHintTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },

  mapHintText: {
    color: SECONDARY,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 3,
  },

  // =====================================================
  // MAP BOTTOM PANEL
  // =====================================================

  mapBottomPanel: {
    backgroundColor: SURFACE,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    elevation: 8,
  },

  mapSelectionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },

  mapSelectionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: '#F4F6F8',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapSelectionButtonActive: {
    backgroundColor: PRIMARY_LIGHT,
    borderColor: '#BFD1D8',
  },

  sourceDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
    marginRight: 7,
  },

  destinationDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SURFACE,
    borderWidth: 2,
    borderColor: RED,
    marginRight: 7,
  },

  mapSelectionText: {
    color: SECONDARY,
    fontSize: 12,
    fontWeight: '800',
  },

  mapSelectionTextActive: {
    color: PRIMARY,
  },

  confirmMapButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmMapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default styles;