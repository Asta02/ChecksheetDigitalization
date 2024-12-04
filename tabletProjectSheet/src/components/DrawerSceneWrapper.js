import {
    View,
    Text,
    StyleSheet,
    Platform,
    useWindowDimensions,
} from 'react-native';
import React from 'react';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import styles from '../styles';

const DrawerSceneWrapper = ({ children }) => {
    return (
        <Animated.View style={[styles.drawercontainer]}>
            {children}
        </Animated.View>
    );
};

export default DrawerSceneWrapper;