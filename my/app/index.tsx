import { Link } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IconSymbol from '../components/ui/IconSymbol';
import mainImage from '../assets/images/graduation-books.png';

const Homescreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconLeft}>
          <IconSymbol name="chevron-right" size={24} color="#fff" />
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>ACA</Text>
        </View>
        <View style={styles.headerIconRight} />
      </View>

      {/* Main Image with overlay */}
      <View style={styles.imageContainer}>
        <Image source={mainImage} style={styles.image} resizeMode="cover" />
        <View style={styles.overlay}>
          <Text style={styles.title}>Welcome to the School{"\n"}Management System</Text>
          <Text style={styles.subtitle}>Effortless School Management Starts Here!</Text>
        </View>
      </View>

      {/* Description Section */}
      <View style={styles.content}>
        <Text style={styles.description}>
          {`Digitize your entire school ecosystem with a\ncloud-based solution built for speed, reliability, and scalability. Manage users, track performance, automate attendance, and keep everyone informed — all from one secure platform.`}
        </Text>
      </View>

      {/* Get Started Button at Bottom Center */}
      <View style={styles.buttonContainer}>
        <Link href="/role" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10151b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#181f27',
  },
  headerIconLeft: {
    width: 32,
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerIconRight: {
    width: 32,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 260,
    backgroundColor: '#e6d6c3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(16,21,27,0.55)',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 4,
  },
  subtitle: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'left',
    opacity: 0.85,
  },
  content: {
    flex: 1,
    backgroundColor: '#10151b',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 32,
    width: '100%',
  },
  button: {
    backgroundColor: '#ff9800',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 28,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default Homescreen; 