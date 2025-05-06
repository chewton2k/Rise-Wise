import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerRight: () => <ProfileIcon /> }}>
      <Tabs.Screen
        name="alarms"
        options={{
          title: 'Alarms',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alarm-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="restudy"
        options={{
          title: 'Restudy',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="refresh-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function ProfileIcon() {
  return (
    <Ionicons
      name="person-circle-outline"
      size={28}
      color="white"
      style={{ marginRight: 15 }}
      onPress={() => {
        // You can navigate to a profile screen later
        alert('Profile clicked!');
      }}
    />
  );
}
