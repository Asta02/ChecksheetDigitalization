import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChecksheetSaya from '../screens/checksheet/checksheetsaya';
import buatchecksheet from '../screens/checksheet/checksheettipe';
import isichecksheet from '../screens/checksheet/checksheetisi';
import checksheettunggu from '../screens/checksheet/checksheettungguttd';
import checksheetcancelissue from '../screens/checksheet/checksheetcancelissue';
import checksheetisikembali from '../screens/checksheet/checksheetisikembali';
import Beranda from '../screens/dashboard/index';
import LoginScreen from '../screens/login/index';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    const [photo, setPhoto] = useState(null);
    const [namaLengkap, setNamaLengkap] = useState(null);

    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const photoOrang = await AsyncStorage.getItem('photo');
                const namaLengkapGet = await AsyncStorage.getItem('namaLengkap');
                setPhoto(photoOrang);
                setNamaLengkap(namaLengkapGet);
            } catch (error) {
                console.error('Failed to load photo from AsyncStorage', error);
            }
        };

        fetchPhoto();
    }, []);

    const drawerIcon = ({ focused, size }, name) => {
        return (
            <Icon
                name={name}
                size={size}
                color={focused ? Colors.active : Colors.inactive}
            />
        );
    };

    return (
        <Drawer.Navigator
            drawerType="slide"
            screenOptions={{
                headerShown: false,
                drawerActiveBackgroundColor: Colors.transparent,
                drawerInactiveBackgroundColor: Colors.transparent,
                drawerActiveTintColor: Colors.active,
                drawerInactiveTintColor: Colors.inactive,
                overlayColor: 'rgba(0, 0, 0, 0.3)',
                drawerPosition:'left',
                drawerStyle: {
                    backgroundColor: Colors.bg,
                    width: '40%',
                    marginTop: 81,
                },
                sceneContainerStyle: {
                    backgroundColor: Colors.bgLayout,
                },
            }}>
            <Drawer.Screen
                name="Profile"
                component={ChecksheetSaya}
                options={{
                    drawerLabel: ({ focused }) => (
                        <View style={styles.drawerProfile}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    source={
                                        photo ? { uri: `https://portalgs.gs.astra.co.id/foto/emp_photos/${photo}` }
                                            : require('../image/Round.png')
                                    }
                                    style={{ width: 50, height: 50, borderRadius: 25, aspectRatio: 1 }}
                                />
                                <View style={{ marginLeft: 8, flex: 1 }}>
                                    <Text style={{ color: Colors.active, textAlign: 'left', marginBottom: 4, marginLeft: 12 }}>{namaLengkap}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                                        <View style={{ backgroundColor: 'green', width: 10, height: 10, borderRadius: 5, marginRight: 5 }} />
                                        <Text style={{ color: 'green' }}>Online</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ),
                }}
            />

            {/* navigasi utama start */}
            <Drawer.Group style={customDrawerItemStyle}>
                <Drawer.Screen
                    name="NAVIGASI UTAMA"
                    component={Beranda}
                    options={{
                        drawerItemStyle: customDrawerItemStyle,
                        backgroundColor: "#fff"
                    }}
                />
            </Drawer.Group>
            {/* navigasi utama end */}

            <Drawer.Group style="">
                <Drawer.Screen
                    name="Beranda"
                    component={Beranda}
                    options={{
                        drawerIcon: options => drawerIcon(options, 'home-outline'),
                    }}
                />
                <Drawer.Screen
                    name="Checksheet Saya"
                    component={ChecksheetSaya}
                    options={{
                        drawerIcon: options => drawerIcon(options, 'inbox'),
                    }}
                />
            </Drawer.Group>

            {/* pengaturan start */}    
            <Drawer.Group style={customDrawerItemStyle}>
                <Drawer.Screen
                    name="PENGATURAN"
                    component={Beranda}
                    options={{
                        drawerItemStyle: customDrawerItemStyle,
                        gestureEnabled: false,
                        swipeEnabled: false,
                        backgroundColor: "#fff"
                    }}
                />
            </Drawer.Group>
            {/* pengaturan end */}

            <Drawer.Screen
                name="Keluar Akun"
                component={LoginScreen}
                options={{
                    drawerIcon: options => drawerIcon(options, 'logout'),
                }}
            />



            {/* Hidden drawer start*/}
            <Drawer.Screen
                name="buatchecksheet"
                component={buatchecksheet}
                options={{
                    drawerItemStyle: customDrawerHideStyle,
                    gestureEnabled: false,
                    swipeEnabled: false,
                    backgroundColor: "#fff"
                }}
            />
            <Drawer.Screen
                name="isichecksheet"
                component={isichecksheet}
                options={{
                    drawerItemStyle: customDrawerHideStyle,
                    gestureEnabled: false,
                    swipeEnabled: false,
                    backgroundColor: "#fff"
                }}
            />
            <Drawer.Screen
                name="checksheettunggu"
                component={checksheettunggu}
                options={{
                    drawerItemStyle: customDrawerHideStyle,
                    gestureEnabled: false,
                    swipeEnabled: false,
                    backgroundColor: "#fff"
                }}
            />
            <Drawer.Screen
                name="checksheetcancelissue"
                component={checksheetcancelissue}
                options={{
                    drawerItemStyle: customDrawerHideStyle,
                    gestureEnabled: false,
                    swipeEnabled: false,
                    backgroundColor: "#fff"
                }}
            />
            <Drawer.Screen
                name="checksheetisikembali"
                component={checksheetisikembali}
                options={{
                    drawerItemStyle: customDrawerHideStyle,
                    gestureEnabled: false,
                    swipeEnabled: false,
                    backgroundColor: "#fff"
                }}
            />
            {/* Hidden drawer end*/}
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;

const Colors = {
    bg: '#313650',
    bgLayout: '#EDF1FD',
    active: '#fff',
    inactive: '#fff',
    transparent: 'transparent',
};

const customDrawerItemStyle = {
    backgroundColor: '#2C3046',
};

const customDrawerHideStyle = {
    backgroundColor: '#2C3046',
    transform: [{ translateX: -2000 }, { translateY: -2000 }]
};
