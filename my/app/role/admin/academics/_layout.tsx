import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { View, Text, StyleSheet, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import ResultTabScreen from '../../../components/academics/ResultTabScreen';
import ClassesTabScreen from '../../../components/academics/ClassesTabScreen';
import SyllabusTabScreen from '../../../components/academics/SyllabusTabScreen';
import TimetableTabScreen from '../../../components/academics/TimetableTabScreen';

const Tab = createMaterialTopTabNavigator();

function AcademicsHeader({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.headerTitle}>Academics</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search all tabs..."
        placeholderTextColor="#A0A0A0"
        value={search}
        onChangeText={setSearch}
      />
    </View>
  );
}

export default function AcademicsTabsLayout() {
  const [search, setSearch] = React.useState('');
  return (
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
      <AcademicsHeader search={search} setSearch={setSearch} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#A259FF',
          tabBarInactiveTintColor: '#A0A0A0',
          tabBarStyle: { backgroundColor: '#23262F' },
          tabBarIndicatorStyle: { backgroundColor: '#A259FF' },
          tabBarLabelStyle: { fontWeight: 'bold' },
          tabBarIcon: ({ color }) => {
            switch (route.name) {
              case 'Result':
                return <FontAwesome name="graduation-cap" size={20} color={color} />;
              case 'Classes':
                return <FontAwesome name="users" size={20} color={color} />;
              case 'Syllabus':
                return <FontAwesome name="list-alt" size={20} color={color} />;
              case 'Time-Table':
                return <FontAwesome name="calendar" size={20} color={color} />;
              default:
                return <FontAwesome name="question" size={20} color={color} />;
            }
          },
          tabBarShowIcon: true,
        })}
      >
        <Tab.Screen name="Result">
          {() => <ResultTabScreen search={search} />}
        </Tab.Screen>
        <Tab.Screen name="Classes">
          {() => <ClassesTabScreen search={search} />}
        </Tab.Screen>
        <Tab.Screen name="Syllabus">
          {() => <SyllabusTabScreen search={search} />}
        </Tab.Screen>
        <Tab.Screen name="Time-Table">
          {() => <TimetableTabScreen search={search} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#181A20',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#23262F',
    color: '#fff',
    borderRadius: 8,
    fontSize: 16,
    padding: 8,
    marginTop: 4,
  },
}); 