import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import styles from '../../styles/components/FeatureRow.styles';

const FeatureRow = ({
  icon,
  title,
  description,
}) => {
  return (
    <View style={styles.container}>

      {/* ==========================================
          ICON
      ========================================== */}

      <View style={styles.iconContainer}>

        <Text style={styles.icon}>
          {icon}
        </Text>

      </View>


      {/* ==========================================
          CONTENT
      ========================================== */}

      <View style={styles.content}>

        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.description}>
          {description}
        </Text>

      </View>


      {/* ==========================================
          ARROW
      ========================================== */}

      <Text style={styles.arrow}>
        ›
      </Text>

    </View>
  );
};

export default FeatureRow;