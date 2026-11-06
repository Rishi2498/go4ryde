import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingTop: 8,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
  },

  backText: {
    fontSize: 32,
    color: '#16384A',
    lineHeight: 34,
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#16384A',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#7A858D',
  },

  // =====================================================
  // CARD
  // =====================================================

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,

    elevation: 2,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#16384A',
    marginBottom: 14,
  },

  // =====================================================
  // DATE / TIME
  // =====================================================

  selectorRow: {
    flexDirection: 'row',
    gap: 10,
  },

  selectorCard: {
    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#F7F9FA',

    borderRadius: 14,

    padding: 12,

    minHeight: 70,
  },

  selectorIcon: {
    fontSize: 21,
    marginRight: 9,
  },

  selectorContent: {
    flex: 1,
  },

  selectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#89949C',
    marginBottom: 4,
  },

  selectorValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16384A',
  },

  // =====================================================
  // SEATS
  // =====================================================

  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  seatInfo: {
    flex: 1,
    paddingRight: 10,
  },

  seatTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#263842',
  },

  seatSubtitle: {
    fontSize: 12,
    color: '#89949C',
    marginTop: 4,
  },

  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    borderRadius: 14,
    padding: 4,
  },

  counterButton: {
    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 1,
  },

  counterButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#16384A',
  },

  counterValue: {
    width: 38,

    textAlign: 'center',

    fontSize: 17,

    fontWeight: '800',

    color: '#16384A',
  },

  // =====================================================
  // PRICE
  // =====================================================

  inputLabel: {
    fontSize: 12,
    color: '#7B878F',
    marginBottom: 7,
  },

  priceContainer: {
    height: 58,

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#F7F9FA',

    borderRadius: 14,

    paddingHorizontal: 14,
  },

  currency: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16384A',
    marginRight: 8,
  },

  priceInput: {
    flex: 1,

    height: 58,

    fontSize: 19,

    fontWeight: '700',

    color: '#16384A',

    paddingVertical: 0,
  },

  perSeat: {
    fontSize: 13,
    color: '#7A858D',
  },

  // =====================================================
  // SUMMARY
  // =====================================================

  summaryCard: {
    backgroundColor: '#16384A',

    borderRadius: 18,

    padding: 17,

    marginBottom: 16,
  },

  summaryTitle: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '800',

    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'flex-start',

    paddingVertical: 6,
  },

  summaryLabel: {
    width: 65,

    fontSize: 11,

    fontWeight: '700',

    color: '#B9C8D0',
  },

  summaryValue: {
    flex: 1,

    textAlign: 'right',

    fontSize: 13,

    fontWeight: '600',

    color: '#FFFFFF',
  },

  summaryPrice: {
    fontSize: 14,

    fontWeight: '800',

    color: '#FFFFFF',
  },

  // =====================================================
  // OFFER BUTTON
  // =====================================================

  offerButton: {
    height: 56,

    borderRadius: 16,

    backgroundColor: '#16384A',

    justifyContent: 'center',

    alignItems: 'center',

    elevation: 3,
  },

  offerButtonDisabled: {
    opacity: 0.6,
  },

  offerButtonText: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '800',
  },

  bottomHint: {
    textAlign: 'center',

    fontSize: 12,

    color: '#8A959D',

    marginTop: 12,

    marginBottom: 10,
  },
});

export default styles;