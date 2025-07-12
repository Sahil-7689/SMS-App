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
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="assignment"
        options={{
          title: 'Assignment',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="tasks" color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaves"
        options={{
          title: 'Leaves',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="calendar-check-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="book" color={color} />,
        }}
      />
    </Tabs>
  );
} 