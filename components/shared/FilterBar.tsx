import { useNavigation } from '@react-navigation/native';
import { __DEV__ } from 'react-native';

// In your component's JSX where the filter options are rendered
// Add this condition near your existing filter options:

{__DEV__ && (
  <TouchableOpacity
    style={[styles.filterOption, { backgroundColor: '#FF5656' }]}
    onPress={() => navigation.navigate('TestMatching')}
  >
    <Text style={[styles.filterText, { color: '#FFFFFF' }]}>DEV</Text>
  </TouchableOpacity>
)} 