import React, { useEffect } from 'react';
import { View, Animated, Image, LogBox } from 'react-native';
import * as Animatable from 'react-native-animatable';
import styles from '../../styles';

const SplashScreen = ({ navigation }) => {
    const logoAnimation = new Animated.Value(0);

    useEffect(() => {
        startAnimation();
    }, []);

    LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
    LogBox.ignoreAllLogs();//Ignore all log notifications

    const startAnimation = () => {
        Animated.timing(logoAnimation, {
            toValue: 1,
            duration: 775,
            useNativeDriver: false,
        }).start(() => {
            navigation.replace('Login');
        });
    };

    const logoInterpolate = logoAnimation.interpolate({
        inputRange: [-1, 1],
        outputRange: [0, 3],
    });

    const logoStyle = {
        transform: [{ translateX: logoInterpolate }],
    };

    const gradientHeight = 700;
    const gradientBackground = ['#313650', '#1B58B0']; // Updated gradient colors
    const data = Array.from({ length: gradientHeight });

    const lightenFactor = 1.5; // Adjust this factor to make it lighter

    return (
        <View style={styles.splashcontainer}>
            {data.map((_, i) => (
                <View
                    key={i}
                    style={{
                        position: 'absolute',
                        backgroundColor: gradientBackground[i % gradientBackground.length],
                        height: 1,
                        bottom: gradientHeight - i - 1,
                        right: 0,
                        left: 0,
                        zIndex: 2,
                        opacity: (1 / gradientHeight) * (i + 1) * lightenFactor,
                    }}
                />
            ))}
            <Animatable.Image
                animation="zoomIn"
                iterationCount="infinite"
                source={require('../../image/Round.png')}
                style={[styles.splashlogo, logoStyle]}
            />
        </View>
    );
};

export default SplashScreen;
