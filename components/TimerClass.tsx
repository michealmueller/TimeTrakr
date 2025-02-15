import React, { useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { StyleSheet, View, Button, SafeAreaView } from 'react-native';

import { Stopwatch } from 'ts-stopwatch';

import { DataTable } from 'react-native-paper';

interface Props {}

interface StopwatchState {
  stopwatch: Stopwatch;
  mountedAndReady?: boolean;
  currentTime: number;
  formattedTime: string;
  intervalId?: NodeJS.Timeout;
  slices?: Stopwatch.Slice[];
}

class TimerClass extends React.Component<Props, StopwatchState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      stopwatch: new Stopwatch(),
      mountedAndReady: false,
      currentTime: 0,
      formattedTime: '00:00:00:000',
    };
    //console.log('Instantiated State: ', this.state);
    
  }

  componentDidMount() {
    this.setState({ mountedAndReady: true });
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }
    this.setState({ mountedAndReady: false });
  }

  toggleStopwatch() {
    const { stopwatch, intervalId } = this.state;

    if (stopwatch.isRunning()) {
      // Shut it down
      stopwatch.stop();

      this.updateSlices(); // Ensure slices are updated when stopwatch is stopped
      
      //this.handleClearInterval();
    } else {
      stopwatch.start();
      const newIntervalId = setInterval(() => {
        this.getTime();
      }, 30.9999999); // Update every 30.9999999 milliseconds

        this.setState({ intervalId: newIntervalId });
        console.log('Stopwatch started.');
      

      this.updateSlices();
    }
  }

  getTime() {
    const current = this.state.stopwatch.getTime();
    //console.log('Current Time: ', current);
    this.setState({
      currentTime: current,
      formattedTime: this.formatTime(current),
    });
  }

  updateSlices() {
    const slices = this.state.stopwatch.getCompletedAndPendingSlices();
    
    this.setState({ slices });

    //console.log('Updated Slices: ', slices);
  }

  handleReset() {
    this.state.stopwatch.reset();
    this.setState({ 
      currentTime: 0,
      formattedTime: '00:00:00:000',
      intervalId: undefined,
      slices: [],
    });
    console.log('Stopwatch has been reset.', this.state);
    this.handleClearInterval();
  }

  private handleSlice() {
    try {
      this.state.stopwatch.slice();
      this.setState({ 
        slices: this.state.stopwatch.getCompletedAndPendingSlices()
      });
    } catch(e) {
      console.error('Error recording slice', e);
    }
    this.updateSlices();
  }

  protected formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}:${this.pad(ms, 3)}`;
  }

  private pad(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }

  private getCompleted() {
    return this.state.stopwatch.getCompletedSlices();
  }

  private getPending() {
    return this.state.stopwatch.getPendingSlice();
  }

  private handlePending() {
    return this.getPending();
  }

  private handleClearInterval() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.setState({ intervalId: undefined });
    }
  }

  render() {
    return (
      <SafeAreaView>
        <ThemedView>
          <ThemedText type="subtitle">Time Elapsed:</ThemedText>
          <View>
            <ThemedText>{this.state.formattedTime}</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <View style={styles.buttonContainer}>
            <Button
              title="Toggle Stopwatch"
              onPress={() => {
                this.toggleStopwatch();
                const slices = this.getCompleted();
                const stopwatch = this.state.stopwatch;
                if (slices.length > 1 && stopwatch.isRunning()) {
                  stopwatch.slice();
                  this.updateSlices();
                }
                this.handleClearInterval();
              }}
            />
            <Button
              title="Reset Timer"
              onPress={() => {
                this.handleReset();
              }}
            />

            <Button
              title="Slice/Lap"
              onPress={() => {
                this.handleSlice();
              }}
            />
          </View>
            <View style={styles.lapContainer}>
            <View style={styles.slicesContainer}>
              <ThemedText type="subtitle">Slices:</ThemedText>
              
              <DataTable>
              <DataTable.Header>
                <DataTable.Title numeric>Start Time</DataTable.Title>
                <DataTable.Title numeric>End Time</DataTable.Title>
                <DataTable.Title numeric>Total Duration</DataTable.Title>
              </DataTable.Header>
              {this.state.slices?.map((slice, index) => (
                <DataTable.Row key={index}>
                <DataTable.Cell numeric>{this.formatTime(slice.startTime)}</DataTable.Cell>
                <DataTable.Cell numeric>{this.formatTime(slice.endTime)}</DataTable.Cell>
                <DataTable.Cell numeric>{this.formatTime(slice.duration)}</DataTable.Cell>
                </DataTable.Row>
              ))}

              {(this.state.slices?.length ?? 0) === 0 && (
                <ThemedText 
                  type="subtitle"
                  style={styles.noSlicesText}
                  >
                    No slices recorded
                </ThemedText>
              )}
              </DataTable>
            </View>
            </View>
        </ThemedView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 10,
  },
  lapContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    padding: 10,
  },
  slicesContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    padding: 10,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  noSlicesText: {
    textAlign: 'center',
    color: 'gray',
  },
});

export default TimerClass;