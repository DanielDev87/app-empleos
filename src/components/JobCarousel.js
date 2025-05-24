import React from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import JobCard from './JobCard';
import colors from '../constants/colors';

const JobCarousel = ({ jobs, loading, onJobPress }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.principal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => onJobPress(item)}
          />
        )}
        keyExtractor={(item) => item.job_id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        snapToInterval={320} // cardWidth + marginHorizontal * 2
        decelerationRate="fast"
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 220,
    marginVertical: 10,
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default JobCarousel; 