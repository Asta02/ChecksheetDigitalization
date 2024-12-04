import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import styles from '../../styles';
import Gif from 'react-native-gif';

const FailedMessage = () => {
    return (
        <View style={styles.failedMessageContainer}>
            <Gif
                style={{ width: 200, height: 200 }}
                source={require('../../image/gif_failed.gif')}
            />
            <Text style={styles.successMessagetitle}>Oops..</Text>
            <Text style={styles.successMessagetitlebottom}>Checksheet Anda gagal disimpan. Mohon coba lagi.</Text>
            <Text style={styles.successMessagetitlebottom}>
                ERROR CODE: <Text style={{ color: '#ffffff' }}>ERROR404</Text>
            </Text>

            <TouchableOpacity
                style={styles.buttonSukses}
            >
                <Text style={{ color: '#FFFFFF', alignSelf: 'center', textAlign: 'center' }}>Coba lagi</Text>
            </TouchableOpacity>
        </View>
    );
};

export default FailedMessage;
