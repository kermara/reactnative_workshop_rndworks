/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import CallDetectorManager from 'react-native-call-detection';
import {apikey} from './keys';
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      featureOn: false,
      incoming: false,
      number: null,
      numberInfo: null,
      loading: false,
      error: null,
    };
  }
  componentDidMount() {
    this.askPermission();
  }
  askPermission = async () => {
    try {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ]);
      console.log('Permissions are:', permissions);
    } catch (err) {
      console.warn(err);
    }
  };
  startListenerTapped = () => {
    this.setState({featureOn: true});
    this.callDetector = new CallDetectorManager(
      (event, number) => {
        if (event === 'Disconnected') {
          // Do something call got disconnected
          this.setState({
            incoming: false,
            number: null,
            numberInfo: null,
            error: null,
            loading: false,
          });
        } else if (event === 'Incoming') {
          // Do something call got incoming
          this.setState({incoming: true, number});
          this.getNumberInfo(number);
        } else if (event === 'Offhook') {
          //Device call state: Off-hook.
          // At least one call exists that is dialing,
          // active, or on hold,
          // and no calls are ringing or waiting.
          this.setState({incoming: true, number});
        } else if (event === 'Missed') {
          // Do something call got missed
          this.setState({
            incoming: false,
            number: null,
            error: null,
            loading: false,
          });
        }
      },
      true, // if you want to read the phone number of the incoming call [ANDROID], otherwise false
      () => {},
      // callback if your permission got denied [ANDROID] [only if
      //you want to read incoming number] default: console.error
      {
        title: 'Phone State Permission',
        message:
          'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
      }, // a custom permission request message to explain to your
      //user, why you need the permission [recommended] - this
      // is the default one
    );
  };
  stopListenerTapped = () => {
    this.setState({
      featureOn: false,
      incoming: false,
      number: null,
      numberInfo: null,
      error: null,
    });
    this.callDetector && this.callDetector.dispose();
  };
  getNumberInfo = async number => {
    try {
      this.setState({loading: true});
      const response = await fetch(
        `https://api.vainu.io/api/v1/prospects/filter/?country=FI&phone=` +
          number,
        {
          method: 'GET',
          headers: {'API-key': apikey},
        },
      );
      const info = await response.json();
      // parses JSON response into native JavaScript objects
      if (info && info[0] && this.state.incoming) {
        this.setState({numberInfo: info[0], loading: false});
      } else {
        this.setState({numberInfo: [0], loading: false});
      }
    } catch (error) {
      this.setState({
        loading: false,
        error: this.state.incoming ? error : null,
      });
    }
  };
  render() {
    const {
      numberInfo,
      incoming,
      number,
      loading,
      error,
      featureOn,
    } = this.state;
    let result;
    if (numberInfo && numberInfo.industry_code === '62010') {
      result = (
        <Text
          style={{
            fontSize: 30,
            color: '#e6e6fa',
            textAlign: 'center',
            padding: 20,
            fontWeight: 'bold',
            marginLeft: 20,
            marginRight: 20,
          }}>
          Industry code 62010: Software Development
        </Text>
      );
    } else if (numberInfo && numberInfo.industry_code === '82200') {
      result = (
        <Text
          style={{
            fontSize: 30,
            color: '#e6e6fa',
            textAlign: 'center',
            padding: 20,
            fontWeight: 'bold',
            marginLeft: 20,
            marginRight: 20,
          }}>
          Industry code 82200: Call Center
        </Text>
      );
    } else {
      result = (
        <Text
          style={{
            fontSize: 30,
            color: '#e6e6fa',
            textAlign: 'center',
            padding: 10,
            fontWeight: 'bold',
            marginLeft: 20,
            marginRight: 20,
          }}>
          Industry code unknown{' '}
        </Text>
      );
    }
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Check the Industry Code of the incoming call
        </Text>
        <TouchableHighlight
          style={styles.button}
          onPress={
            featureOn ? this.stopListenerTapped : this.startListenerTapped
          }>
          <View
            style={{
              width: 200,
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 50,
              backgroundColor: featureOn ? '#006400' : '#ff4500',
            }}>
            <Text style={styles.text}>{featureOn ? `Yes` : `No`} </Text>
          </View>
        </TouchableHighlight>
        {incoming && (
          <Text style={{fontSize: 20, color: '#e6e6fa', padding: 20}}>
            {' '}
            Incoming call from {number}
          </Text>
        )}
        {loading && (
          <View>
            <Text style={{fontSize: 20}}>Loading ...</Text>
            <ActivityIndicator size="large" color="g#ff4500" />
          </View>
        )}
        {numberInfo && result}
        {error && <Text>Error happened</Text>}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#87ceeb',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    padding: 20,
    fontSize: 22,
    color: '#e6e6fa',
    textAlign: 'center',
  },
});
