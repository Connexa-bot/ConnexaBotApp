import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';

const mockCalls = [
  {
    id: '1',
    name: 'John Doe',
    time: 'Yesterday, 10:30 PM',
    type: 'missed',
    direction: 'incoming',
  },
  {
    id: '2',
    name: 'Jane Smith',
    time: 'Yesterday, 8:15 PM',
    type: 'outgoing',
    direction: 'outgoing',
  },
  {
    id: '3',
    name: 'Peter Jones',
    time: 'October 4, 5:00 PM',
    type: 'incoming',
    direction: 'incoming',
  },
    {
    id: '4',
    name: 'Mary Jane',
    time: 'October 3, 11:00 AM',
    type: 'missed',
    direction: 'incoming',
  },
];

const CallItem = ({ name, time, type, direction }) => {
  const isMissed = type === 'missed';
  const isOutgoing = direction === 'outgoing';

  return (
    <TouchableOpacity style={styles.callItem}>
      <Avatar name={name} />
      <View style={styles.callInfo}>
        <Text style={[styles.callName, isMissed && { color: '#F15C6D' }]}>
          {name}
        </Text>
        <View style={styles.callMeta}>
          <MaterialIcons
            name={isOutgoing ? 'call-made' : 'call-received'}
            size={16}
            color={isMissed ? '#F15C6D' : '#00A884'}
          />
          <Text style={styles.callTime}>{time}</Text>
        </View>
      </View>
      <TouchableOpacity>
        <MaterialIcons name="call" size={24} color="#00A884" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function CallsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockCalls}
        renderItem={({ item }) => <CallItem {...item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Calls</Text>
            </View>
            <TouchableOpacity style={styles.createLink}>
              <View style={styles.linkIcon}>
                <MaterialIcons name="link" size={24} color="#FFF" />
              </View>
              <View>
                <Text style={styles.linkText}>Create call link</Text>
                <Text style={styles.linkSubText}>
                  Share a link for your WhatsApp call
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Recent</Text>
          </>
        }
      />
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add-ic-call" size={24} color="#111B21" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111B21',
  },
  headerContainer: {
    padding: 15,
  },
  headerTitle: {
    fontSize: 22,
    color: '#E9EDEF',
    fontWeight: 'bold',
  },
  createLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  linkIcon: {
    backgroundColor: '#00A884',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  linkText: {
    color: '#E9EDEF',
    fontSize: 17,
    fontWeight: '600',
  },
  linkSubText: {
    color: '#8696A0',
    fontSize: 15,
  },
  sectionTitle: {
    color: '#8696A0',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  callInfo: {
    flex: 1,
    marginLeft: 15,
  },
  callName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E9EDEF',
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  callTime: {
    fontSize: 15,
    color: '#8696A0',
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#00A884',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});