import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#A259FF',
      tabBarInactiveTintColor: '#B3B3B3',
      tabBarStyle: { backgroundColor: '#181A20', borderTopColor: '#232136' },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="score"
        options={{
          title: 'Score',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="calendar-check-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: 'Time Table',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          title: 'Result',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="file-text-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="money" color={color} />,
        }}
      />
    </Tabs>
  );
} 