import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({

  tabBar: {
    backgroundColor: '#0D1020',

    borderTopWidth: 1,

    borderTopColor: '#252A40',

    height: 70,

    paddingTop: 7,

    paddingBottom: 9,

    elevation: 10,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: -4,
    },

    shadowOpacity: 0.2,

    shadowRadius: 10,
  },

  tabIcon: {
    width: 42,
    height: 32,

    alignItems: 'center',

    justifyContent: 'center',
  },

  tabIconActive: {
    fontSize: 20,

    color: '#A855F7',

    fontWeight: '800',
  },

  tabIconInactive: {
    fontSize: 18,

    color: '#686E83',

    fontWeight: '500',
  },

  tabLabel: {
    fontSize: 10,

    fontWeight: '700',

    marginTop: 1,
  },

});

export default styles;