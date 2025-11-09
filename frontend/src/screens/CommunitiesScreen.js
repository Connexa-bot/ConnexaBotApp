import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function CommunitiesScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation();


  const handleMenuPress = () => {
    if (Platform.OS === 'ios') {
      const { ActionSheetIOS } = require('react-native');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Settings', 'Cancel'],
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            nav.navigate('Settings');
          }
        }
      );
    } else {
      nav.navigate('Settings');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        backgroundColor={colors.header} 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />

      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.header, paddingTop: insets.top }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Communities</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleMenuPress} style={styles.headerIcon}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.headerText} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.secondaryBackground }]}>
            <Ionicons name="people" size={64} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Stay connected with a community
        </Text>

        <Text style={[styles.description, { color: colors.secondaryText }]}>
          Communities bring members together in topic-based groups, and make it easy to get admin announcements. Any community you're added to will appear here.
        </Text>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => {}}
        >
          <Text style={styles.buttonText}>Start your community</Text>
        </TouchableOpacity>

        <View style={styles.exampleContainer}>
          <Text style={[styles.exampleTitle, { color: colors.text }]}>
            Example communities
          </Text>

          <TouchableOpacity style={[styles.communityItem, { borderBottomColor: colors.divider }]}>
            <View style={[styles.communityIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="school" size={28} color="#2196F3" />
            </View>
            <View style={styles.communityInfo}>
              <Text style={[styles.communityName, { color: colors.text }]}>School</Text>
              <Text style={[styles.communityDesc, { color: colors.secondaryText }]}>
                Parents, teachers, students
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.communityItem, { borderBottomColor: colors.divider }]}>
            <View style={[styles.communityIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="home" size={28} color="#9C27B0" />
            </View>
            <View style={styles.communityInfo}>
              <Text style={[styles.communityName, { color: colors.text }]}>Neighborhood</Text>
              <Text style={[styles.communityDesc, { color: colors.secondaryText }]}>
                Neighbors, local businesses
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.communityItem, { borderBottomColor: colors.divider }]}>
            <View style={[styles.communityIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="briefcase" size={28} color="#4CAF50" />
            </View>
            <View style={styles.communityInfo}>
              <Text style={[styles.communityName, { color: colors.text }]}>Workplace</Text>
              <Text style={[styles.communityDesc, { color: colors.secondaryText }]}>
                Colleagues, work teams
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 4,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 48,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exampleContainer: {
    width: '100%',
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  communityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  communityDesc: {
    fontSize: 14,
  },
});