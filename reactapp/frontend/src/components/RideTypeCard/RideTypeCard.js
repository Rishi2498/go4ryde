import React from 'react';

import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from '../../styles/components/RideTypeCard.styles';

const RideTypeCard = ({
  icon,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.78}
      onPress={onPress}>

      {/* ===============================================
          TOP ROW
      =============================================== */}

      <View style={styles.topRow}>

        <View style={styles.iconContainer}>

          <Text style={styles.icon}>
            {icon}
          </Text>

        </View>

        <View style={styles.arrowContainer}>

          <Text style={styles.arrow}>
            →
          </Text>

        </View>

      </View>


      {/* ===============================================
          TITLE
      =============================================== */}

      <Text style={styles.title}>
        {title}
      </Text>


      {/* ===============================================
          DESCRIPTION
      =============================================== */}

      <Text style={styles.description}>
        {description}
      </Text>


      {/* ===============================================
          ACTION
      =============================================== */}

      <View style={styles.actionRow}>

        <Text style={styles.actionText}>
          Offer {title.toLowerCase()}
        </Text>

        <Text style={styles.actionArrow}>
          →
        </Text>

      </View>

    </TouchableOpacity>
  );
};

export default RideTypeCard;