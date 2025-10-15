
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const StatusRing = ({ 
  size = 56, 
  strokeWidth = 2.5, 
  hasStatus = false, 
  isViewed = false,
  progress = 1,
  children 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Status colors
  const activeColor = '#00A884'; // WhatsApp green for unviewed
  const viewedColor = '#667781'; // Gray for viewed

  if (!hasStatus) {
    // No status ring, just show the content
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={activeColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={activeColor} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isViewed ? viewedColor : "url(#statusGradient)"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    width: '85%',
    height: '85%',
    borderRadius: 1000,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StatusRing;
