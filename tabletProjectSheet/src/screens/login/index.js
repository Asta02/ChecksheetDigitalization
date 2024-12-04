//LoginScreen
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, Image, TouchableOpacity, BackHandler, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { ScrollView } from 'react-native-gesture-handler';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const defaultOption = 'portalgs';

    useEffect(() => {
        const clearStorage = async () => {
            try {
                await AsyncStorage.clear();
                console.log('AsyncStorage cleared successfully.');
            } catch (error) {
                console.error('Error clearing AsyncStorage:', error);
            }
        };

        clearStorage();
    }, []);

    // Function to compute MD5 hash
    const MD5Hash = (value) => {
        return CryptoJS.MD5(value).toString(CryptoJS.enc.Hex);
    };

    // Function to encrypt a string using TripleDES
    const EncryptString = (stringToEncrypt) => {
        const mKey = "PasswordKey";
        const hashedKey = MD5Hash(mKey);

        const encrypted = CryptoJS.TripleDES.encrypt(stringToEncrypt, CryptoJS.enc.Hex.parse(hashedKey), {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });

        return encrypted.toString();
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackPress
        );

        return () => backHandler.remove();
    }, []);

    const handleBackPress = () => {
        showExitConfirmation();
        return true; // Prevent default behavior (closing the app)
    };

    const showExitConfirmation = () => {
        Alert.alert(
            'Konfirmasi',
            'Anda ingin keluar aplikasi?',
            [
                {
                    text: 'Ya',
                    onPress: () => BackHandler.exitApp(),
                },
                {
                    text: 'Tidak',
                    style: 'cancel',
                },
            ],
            { cancelable: false }
        );
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    //for drpdown
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(defaultOption);
    const [items, setItems] = useState([
        { label: 'Portal GS', value: 'portalgs' },
        { label: 'LDAP', value: 'ldap' }
    ]);

    const handleLogin = async () => {
        // if (value === 'ldap') {
        //     try {
        //         const getResponse = await fetch(`http://10.19.101.166:3003/getUserDataLDAP?username=${username}&password=${password}`, {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             }
        //         });

        //         if (!getResponse.ok) {
        //             throw new Error('Failed to login LDAP');
        //         }

        //         const responseData = await getResponse.json();

        //         if (responseData.sqlUserData && responseData.sqlUserData.length > 0) {
        //             const userNpk = responseData.sqlUserData[0].user_npk;
        //             await AsyncStorage.setItem('userNPK', userNpk);

        //             const getData = await fetch(`http://10.19.101.166:3003/getUserDataPortalGSForLDAP?npk=${userNpk}`, {
        //                 method: 'GET',
        //                 headers: {
        //                     'Content-Type': 'application/json'
        //                 }
        //             });

        //             if (!getData.ok) {
        //                 throw new Error('Failed to get data');
        //             }

        //             const userData = await getData.json();

        //             if (userData.length > 0) {
        //                 const user = userData[0];

        //                 await AsyncStorage.setItem('emp_id', user.emp_id);
        //                 await AsyncStorage.setItem('photo', user.photo);
        //                 await AsyncStorage.setItem('namaLengkap', user.full_name);
        //                 navigation.replace('dashboard');
        //             } 
        //         } else {
        //             setIsModalVisible(true);
        //             setErrorMessage('Username atau password anda tidak sesuai.');
        //         }

        //     } catch (error) {
        //         console.error('Error getting data:', error);
        //         setIsModalVisible(true);
        //         setErrorMessage('Username atau password anda tidak sesuai: ' + error.message);
        //     }
        // } else if (value === 'portalgs'){
        //     const encryptedString = EncryptString(password);
        //     try {
        //         const getResponse = await fetch(`http://10.19.101.166:3003/getUserDataPortalGS?npk=${username}&password=${encryptedString}`, {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             }
        //         });
        //         if (!getResponse.ok) {
        //             throw new Error('Akun anda belum terdaftar silahkan hubungi admin');
        //         }

        //         const userData = await getResponse.json();

        //         if (userData.length > 0) {
        //             const user = userData[0];

        //             await AsyncStorage.setItem('emp_id', user.emp_id);
        //             await AsyncStorage.setItem('photo', user.photo);
        //             await AsyncStorage.setItem('userNPK', user.user_npk);
        //             await AsyncStorage.setItem('namaLengkap', user.full_name);
        //             navigation.replace('dashboard');
        //         } else {
        //             setIsModalVisible(true);
        //             setErrorMessage('Username atau password anda tidak sesuai.');
        //         }
        //     } catch (error) {
        //         console.error('Error getting data:', error);
        //         setIsModalVisible(true);
        //         setErrorMessage('Failed to authenticate. Please try again: ' + error.message);
        //     }
        // }
        navigation.replace('dashboard');
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <View style={styles.logincontainer}>
            <View style={styles.logintitle}>
                <Text style={styles.digitalisasiText}>Digitalisasi</Text>
                <Text style={styles.checksheetText}>Checksheet</Text>
            </View>
            <View style={styles.signintitle}>
                <Text style={styles.signinText}>Sign in untuk melanjutkan </Text>
            </View>
            {errorMessage ? <Text style={styles.loginerror}>{errorMessage}</Text> : null}

            {/* Login and password box Start  */}
            <Text style={styles.UsernamePtext}>Username </Text>
            <View style={styles.inputContainer}>
                <Icon name="person" size={24} style={{ marginRight: 15 }} color="#A2A2A7" />
                <TextInput
                    style={{ flex: 1, opacity: 0.8, color: 'black' }}
                    placeholder="Username"
                    autoCapitalize="none"
                    placeholderTextColor="#a2a2a7"
                    underlineColorAndroid={"transparent"}
                    value={username}
                    onChangeText={(text) => setUsername(text)}
                />
            </View>

            <Text style={styles.UsernamePtext}>Password </Text>
            <View style={styles.inputContainer}>
                <Icon name="lock" size={24} style={{ marginRight: 15 }} color="#A2A2A7" />
                <TextInput
                    style={{ flex: 1, opacity: 0.8, color: 'black' }}
                    placeholder="Password"
                    placeholderTextColor="#a2a2a7"
                    secureTextEntry={!isPasswordVisible}
                    value={password}
                    underlineColorAndroid="transparent"
                    onChangeText={(text) => setPassword(text)}
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Icon
                        name={isPasswordVisible ? 'visibility' : 'visibility-off'}
                        size={24}
                        color="#1B58B0"
                    />
                </TouchableOpacity>
            </View>
            {/* Login and password box End  */}

            {/* Dropdown Start  */}
            <View>
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#A2A2A7', opacity:0.5 }}>
                    {/* this is for line (garis yang di bawah password) */}
                </View>
                
                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Select an option..."
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        borderWidth: 0.8,
                        borderColor: '#A2A2A7',
                        height: 50,
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        marginTop: 14,
                    }}
                    dropDownContainerStyle={{
                        backgroundColor: '#fff', // Customize the dropdown container background color
                        borderWidth: 0.8,
                        borderColor: '#A2A2A7',
                        borderRadius: 12,
                    }}
                />
            </View>
            {/* Dropdown end  */}

            {/* Footer Start  */}
            <TouchableOpacity style={styles.footerContainer} onPress={handleLogin}>
                <Image
                    source={require('../../image/Sign_in_squre.png')}
                    style={styles.logo}
                />
                <Text style={styles.footerText} underlineColorAndroid={"transparent"}>
                    Sign in
                </Text>
            </TouchableOpacity>
            {/* Footer End  */}

            {/* Modal Start  */}
            <Modal
                animationType="none"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.loginmodalContainer}>
                    <View style={[styles.loginmodalContent]}>
                        <Text style={[styles.loginmodalTextatas]}>Oops.. </Text>
                        <Text style={[styles.loginmodalTexttengah]}>Terjadi kesalahan saat sign in. Mohon coba lagi. </Text>
                        <Text style={[styles.loginmodalTextbawah]}>ERROR CODE: {errorMessage} </Text>
                        <TouchableOpacity
                            style={styles.buttonModal}
                            onPress={closeModal}
                        >
                            <Text style={{ color: '#FFFFFF', alignSelf: 'center', textAlign: 'center' }}>Coba lagi</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Modal End  */}
        </View>
    );
};

export default LoginScreen;
