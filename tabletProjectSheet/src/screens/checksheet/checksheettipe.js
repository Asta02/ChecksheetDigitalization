import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    SafeAreaView,
    TouchableOpacity,
    Keyboard,
    Image,
    ToastAndroid,
    BackHandler,
    TextInput
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { sampleData } from '../../utils/sampleData';
import DrawerSceneWrapper from '../../components/DrawerSceneWrapper';
import styles from '../../styles';
import ChecksheetNotifListing from '../../components/NotifChecksheet';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
DropDownPicker.setListMode("SCROLLVIEW");

const ChecksheetTipe = ({ navigation }) => {
    const { openDrawer } = navigation;
    const [showDrawer, setShowDrawer] = useState(false);
    const [showScan, setShowScan] = useState(false);
    const [keyboardOpened, setKeyboardOpened] = useState(false);
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardOpened(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardOpened(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);
    const [noQR, setNoQR] = useState("Silahkan scan QR");
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        const fetchNotif = async () => {
            const empId = await AsyncStorage.getItem('emp_id');

            try {
                const response = await fetch(`http://10.19.101.166:3003/getNotification/${empId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch notification data');
                }

                const notifData = await response.json();

                // Fetch employee data for each notification
                const fetchEmpData = async (emp_id) => {
                    const empResponse = await fetch(`http://10.19.101.166:3003/getEmpData/${emp_id}`);

                    if (!empResponse.ok) {
                        throw new Error(`Failed to fetch employee data for emp_id: ${emp_id}`);
                    }

                    const empData = await empResponse.json();

                    return empData;
                };

                const enrichedData = await Promise.all(
                    notifData.map(async (item) => {
                        const empData = await fetchEmpData(item.emp_id);
                        const fullName = empData.find(emp => emp.emp_id === item.emp_id).Full_Name; // Find and extract Full_Name

                        const enrichedItem = {
                            id: item.id_checksheettransaction,
                            kode: item.kode_checksheet,
                            title: item.nama_form,
                            status: item.checksheetTransaction_status,
                            tanggal: item.checksheet_modifDate ? new Date(item.checksheet_modifDate).toISOString() : null,
                            nama: fullName,
                        };
                        return enrichedItem;
                    })
                );
                setNotifications(enrichedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchNotif();
    }, []);
    const [selected, setSelected] = useState(null);
    const [isFound, setIsFound] = useState(false);
    const [isFirst, setIsFirst] = useState(true);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [valueWo, setvalueWo] = useState(null);
    const [valueTglCheck, setvalueTglCheck] = useState(null);
    const [valueTglDelivery, setvalueTglDelivery] = useState(null);
    const [shiftData, setShiftData] = useState([]);
    const [items, setItems] = useState([]);
    useEffect(() => {
        const fetchShift = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getShift');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const shiftData = await response.json();
                setShiftData(shiftData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchShift();
    }, []);
    useEffect(() => {
        const constructedItems = shiftData.map(shift => ({
            label: shift.shift_name,
            value: shift.shift_id.toString()
        }));
        setItems(constructedItems);
    }, [shiftData]);

    const [idForm, setIdForm] = useState(null);
    const handlePress = (index, id_form) => {
        if (index !== 1) {
            ToastAndroid.showWithGravity(
                'Feature sedang dalam proses pengembangan',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
        } else if (id_form != null || id_form != '') {
            setSelected(index);
            setIdForm(id_form);
        } else {
            ToastAndroid.showWithGravity(
                'Silahkan tekan tipe checksheet yang dipilih sekali lagi',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
        }
    };

    const [isScanning, setIsScanning] = useState(false);
    const scanQR = async () => {
        try {
            if (selected !== null && idForm !== null) {
                setIsScanning(true);
                setShowScan(true);
            } else {
                ToastAndroid.showWithGravity(
                    'Silahkan pilih tipe checksheet dahulu',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );
            }
        } catch (error) {
            // Handle any errors that might occur during the scanning process
            console.error('Error during QR scan:', error);
        } finally {
            setIsFound(true);
            setIsScanning(false);
            setShowScan(false);
            setIsFirst(false);
        }
    };    
    const onSuccess = async (e) => {
        if (e.data) {
            setIsFound(true);
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
            setvalueTglCheck(formattedDate);
            setvalueTglDelivery(formattedDate);
            const separatedData = e.data.trim().split('/');
            const valWoTemp = separatedData[0].trim() 

            try {
                const responseItemNumber = await fetch(`http://10.19.101.166:3003/getItemNumber/${valWoTemp}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!responseItemNumber.ok) {
                    throw new Error('Network response was not ok');
                }

                const dataItemNumber = await responseItemNumber.json();
                if (dataItemNumber.length > 0) { // Check if dataItemNumber is not an empty array
                    if (separatedData.length === 2) {
                        setNoQR(e.data);
                        setvalueWo(valWoTemp);
                    }
                } else {
                    setIsFound(false);
                    setIsScanning(false);
                    setShowScan(false);
                    setIsFirst(false);
                    setNoQR(e.data);
                    ToastAndroid.showWithGravity(
                        'No WO tidak ditemukan di dalam database',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }

            setIsScanning(false);
            setShowScan(false);
            setIsFirst(false);
        }
    };

    const [label, setLabel] = useState(null);
    useEffect(() => {
        if (value !== null) {
            const selectedItem = items.find(item => item.value === value);
            if (selectedItem) {
                setLabel(selectedItem.label);
            }
        }
    }, [value]);

    const [empId, setEmpId] = useState(null);
    const [namaLengkap, setNamaLengkap] = useState(null);
    const [userNPK, setUserNPK] = useState(null);
    useEffect(() => {
        const retrieveData = async () => {
            try {
                const getEmpId = await AsyncStorage.getItem('emp_id');
                const getNamaLengkap = await AsyncStorage.getItem('namaLengkap');
                const getUserNPK = await AsyncStorage.getItem('userNPK');
                setEmpId(getEmpId);
                setNamaLengkap(getNamaLengkap);
                setUserNPK(getUserNPK);
            } catch (error) {
                console.error('Error retrieving data:', error);
            }
        };
        retrieveData();
    }, []);

    const startBuat = async () => {
        // if (value !== null) {
        //     const dtToday = new Date();

        //     try {
        //         const response = await fetch('http://10.19.101.166:3003/createChecksheetTransaction', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             },
        //             body: JSON.stringify({
        //                 id_form: idForm,
        //                 no_wo: valueWo,
        //                 shift: value,
        //                 checksheet_createBy: userNPK,
        //                 emp_id: empId
        //             })
        //         });

        //         if (!response.ok) {
        //             throw new Error('Failed to create checksheet transaction', response);
        //         } else {
        //             const responseData = await response.json();
        //             const lastInsertedID = responseData.lastInsertedID;

        //             const valuesToPass = {
        //                 valueShift: label,
        //                 valueWo: valueWo,
        //                 valueTglCheck: dtToday,
        //                 valueTglDelivery: dtToday,
        //                 lastInsertedID: lastInsertedID
        //             };

        //             navigation.replace('drawer', { screen: 'isichecksheet', params: valuesToPass });
        //         }
        //     } catch (error) {
        //         console.error('Error creating checksheet transaction:', error);
        //         ToastAndroid.showWithGravity(
        //             'Error creating checksheet transaction',
        //             ToastAndroid.SHORT,
        //             ToastAndroid.CENTER
        //         );
        //         ToastAndroid.showWithGravity(
        //             'Silahkan tekan tipe checksheet yang dipilih sekali lagi',
        //             ToastAndroid.SHORT,
        //             ToastAndroid.CENTER
        //         );
        //     }
        //     finally {
        //         setIdForm(null)
        //     }
        // } else {
        //     ToastAndroid.showWithGravity(
        //         'Silahkan pilih shift sebelum memulai pengisian checksheet',
        //         ToastAndroid.SHORT,
        //         ToastAndroid.CENTER
        //     );
        // }
        // const responseData = await response.json();
        // const lastInsertedID = responseData.lastInsertedID;

        const valuesToPass = {
            valueShift: "label",
            valueWo: "valueWo",
            valueTglCheck: "dtToday",
            valueTglDelivery: "dtToday",
            lastInsertedID: "lastInsertedID"
        };

        navigation.replace('drawer', { screen: 'isichecksheet', params: valuesToPass });
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackPress
        );

        return () => backHandler.remove();
    }, []);
    const handleBackPress = () => {
        navigation.replace('dashboard');
        return true;
    };

    const handleNotificationClick = () => {
        setShowDrawer(true);
    };

    const closeDrawer = () => {
        setShowDrawer(false);
    };

    const closeScan = () => {
        setShowScan(false);
        setIsScanning(false);
    };

    const [formData, setFormData] = useState([
        { kode: 'Loading data....', nama: 'Loading data....' },
        { kode: 'Loading data....', nama: 'Loading data....' },
        { kode: 'Loading data....', nama: 'Loading data....' }
    ]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getForm');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const checksheetData = await response.json();
                const formData = checksheetData.map(item => ({
                    id: item.id_form,
                    kode: item.kode_checksheet,
                    nama: item.nama_form
                }));
                setFormData(formData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const [photo, setPhoto] = useState(null);
    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const photoOrang = await AsyncStorage.getItem('photo');
                setPhoto(photoOrang);
            } catch (error) {
                console.error('Failed to load photo from AsyncStorage', error);
            }
        };

        fetchPhoto();
    }, []);

    return (
        <DrawerSceneWrapper >
            {isScanning === true && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showScan}
                    onRequestClose={closeScan}
                >
                    <QRCodeScanner
                        onRead={onSuccess}
                        reactivate={true}
                        reactivateTimeout={500}
                        showMarker={true}
                        flashMode={RNCamera.Constants.FlashMode.torch}
                        cameraStyle={styles.cameraContainer}
                        topViewStyle={styles.topView}
                        bottomViewStyle={styles.bottomView}
                        topContent={
                            <View style={styles.topContent}>
                                {/* You can customize the top content of the scanner here */}
                            </View>
                        }
                        bottomContent={
                            <View style={styles.bottomContent}>
                                {/* You can customize the bottom content of the scanner here */}
                            </View>
                        }
                    />
                </Modal>
            )}
            {isScanning === false && (    
                <SafeAreaView style={styles.container}>
                    <LinearGradient
                        colors={['#1C5FB6', '#043987']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.header}
                    >
                        <TouchableOpacity onPress={openDrawer}>
                            <Icon name="menu" color="#fff" size={30} style={{ paddingLeft: 4 }} />
                        </TouchableOpacity>
                        <View style={styles.iconContainerDashboard}>
                            <TouchableOpacity onPress={handleNotificationClick}>
                                {notifications.length > 0 ? (
                                    <View style={styles.iconSpacingDashboard}>
                                        <Icon name="notifications" size={32} color="#fff" />
                                        <View style={styles.redDot}></View>
                                    </View>
                                ) : (
                                    <View style={styles.iconSpacingDashboard}>
                                        <Icon name="notifications" size={32} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => console.log('Icon 3 pressed')}>
                                <View style={[styles.circularImageContainer, styles.iconSpacingDashboard]}>
                                    <Image
                                        source={
                                            photo ? { uri: `https://portalgs.gs.astra.co.id/foto/emp_photos/${photo}` }
                                                : require('../../image/Round.png')
                                        }
                                        style={styles.circularImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <ScrollView>
                        <Text style={styles.notifTopTextBuatChecksheet}>
                            Buat Checksheet
                        </Text>
                        <View style={styles.wrapperIndexBuatChecksheet}>
                            <View style={styles.rectangleBoxBuatChecksheet}>
                                <View style={styles.topTextContainerBuatChecksheet}>
                                    <Text style={styles.topLeftBoxTextBuatChecksheet}>Tipe Checksheet</Text>
                                    <View style={styles.topTextContainerBuatChecksheet}>
                                        {formData.map((item, index) => (
                                            <TouchableOpacity key={item.id} onPress={() => handlePress(index + 1, item.id)}>
                                                <View style={[styles.inputContainerTipeChecksheet, selected === index + 1 ? styles.selected : null]}>
                                                    <Text style={[styles.listTitle, { color: 'rgb(118, 155, 208)' }]}>
                                                        {formData.length > 0 && (
                                                            <>
                                                                {item.kode}{'          '}
                                                                <Text style={{ color: selected === index + 1 ? 'rgba(255, 255, 255, 0.8)' : 'black' }}>
                                                                    {item.nama}
                                                                </Text>
                                                            </>
                                                        )}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.wrapperIndexBuatChecksheet, { paddingBottom: 300 }]}>
                            <View style={isFound ? styles.rectangleBoxBuatChecksheet2 : (isFirst ? [styles.rectangleBoxBuatChecksheet2, { height: 'auto' }] : [styles.rectangleBoxBuatChecksheet2, { height: 'auto' }])}>
                                <Text style={styles.topLeftBoxTextBuatChecksheet}>Scan QR Code</Text>
                                <TouchableOpacity onPress={scanQR}>
                                    <View style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)' }]}>
                                        <Image
                                            source={require('../../image/u_qrcode-scan.png')}
                                            style={styles.logo}
                                        />
                                        <Text
                                            style={{ flex: 1, opacity: 0.8, color: 'black', fontWeight: 'bold' }}
                                            autoCapitalize="none"
                                            placeholderTextColor="#a2a2a7"
                                            underlineColorAndroid={"transparent"}
                                        >
                                            {noQR}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                {isFound ? (
                                    <>
                                        <View style={[styles.qrContainer, { marginTop: -20 }]}>
                                            <Icon name="check-circle" size={24} style={{ marginRight: 8 }} color="#7BB662" />
                                            <Text style={{ color: '#7BB662', fontSize: 12 }}>
                                                Nomor QR ditemukan. Pastikan semua data benar sebelum memulai.
                                            </Text>
                                        </View>
                                        {/* Top Left and Top Right Items */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -0 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.UsernamePtext}>Tanggal Check</Text>
                                                <View style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', width: "98%" }]}>
                                                    <Image
                                                        source={require('../../image/u_user-check.png')}
                                                        style={styles.logo}
                                                    />
                                                    <Text
                                                        style={{ opacity: 0.8, color: 'black', fontWeight: 'bold' }}
                                                        autoCapitalize="none"
                                                        placeholderTextColor="#a2a2a7"
                                                        underlineColorAndroid={"transparent"}
                                                    >
                                                        {valueTglCheck}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.UsernamePtext}>Tanggal Delivery</Text>
                                                <View style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', width: "100%" }]}>
                                                    <Image
                                                        source={require('../../image/u_truck.png')}
                                                        style={styles.logo}
                                                    />
                                                    <Text
                                                        style={{ opacity: 0.8, color: 'black', fontWeight: 'bold' }}
                                                        autoCapitalize="none"
                                                        placeholderTextColor="#a2a2a7"
                                                        underlineColorAndroid={"transparent"}
                                                    >
                                                        {valueTglDelivery}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Bottom Left and Bottom Right Items */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 0 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.UsernamePtext}>Nomor WO</Text>
                                                <View style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', width: "98%" }]}>
                                                    <Image
                                                        source={require('../../image/u_tag-alt.png')}
                                                        style={styles.logo}
                                                    />
                                                    <Text
                                                        style={{ opacity: 0.8, color: 'black', fontWeight: 'bold' }}
                                                        autoCapitalize="none"
                                                        placeholderTextColor="#a2a2a7"
                                                        underlineColorAndroid={"transparent"}
                                                    >
                                                        {valueWo}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.UsernamePtext}>
                                                    Shift <Text style={{ color: '#E03C32' }}>*</Text>
                                                </Text>
                                                <View style={[styles.inputContainer, { backgroundColor: '#FFFFFF', width: "100%" }]}>
                                                    <Image
                                                        source={require('../../image/u_qrcode-scan.png')}
                                                        style={styles.logo}
                                                    />
                                                    <View style={{ flex: 1, transform: [{ translateX: -8 }] }}>
                                                        <DropDownPicker
                                                            open={open}
                                                            value={value}
                                                            items={items}
                                                            setOpen={setOpen}
                                                            setValue={setValue}
                                                            setItems={setItems}
                                                            onChangeItem={(item) => handleChangeItem(item.value)}
                                                            placeholder="Silahkan Pilih shift..."
                                                            searchable={true}
                                                            textStyle={{ color: 'black' }}
                                                            style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 0.8,
                                                                borderColor: '#A2A2A7',
                                                                borderRadius: 12,
                                                                paddingHorizontal: 10,
                                                                width: "107%",
                                                                borderLeftWidth: 0,
                                                            }}
                                                            dropDownContainerStyle={{
                                                                backgroundColor: '#fff',
                                                                borderWidth: 0.8,
                                                                borderColor: '#A2A2A7',
                                                                borderRadius: 12,
                                                                width: "107%",
                                                                maxheight: "360%"
                                                            }}
                                                            itemStyle={{
                                                                fontFamily: 'Rubik',
                                                                fontSize: 16,
                                                                fontWeight: '400',
                                                                opacity: 1.2,
                                                                letterSpacing: 0,
                                                                textAlign: 'left',
                                                                color: '#000000',
                                                            }}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </>
                                ) : null}
                                {isFound === false && isFirst === false ? (
                                    <View style={styles.qrContainer}>
                                        <Icon name="cancel" size={24} style={{ marginRight: 8 }} color="#E03C32" />
                                        <Text style={{ color: '#E03C32', fontSize: 12 }}>
                                            Nomor QR tidak terdaftar/salah. Mohon coba lagi.
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </ScrollView>
                    {/* Footer Start  */}
                    {selected !== null && idForm !== null && isFound === false && (
                        <TouchableOpacity onPress={scanQR} style={styles.footerContainer}>
                            <Image
                                source={require('../../image/Scan_alt.png')}
                                style={styles.logo}
                            />
                            <Text style={styles.footerText2} underlineColorAndroid={"transparent"}>
                                SCAN QR CODE
                            </Text>
                        </TouchableOpacity>
                    )}

                    {isFound !== false && !keyboardOpened && (
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity onPress={handleBackPress} style={[styles.footerContainer, { backgroundColor: '#D8DDEA' }]}>
                                        <Text style={[styles.footerText2, { color: 'rgba(0, 0, 0, 0.3)' }]} underlineColorAndroid={"transparent"}>
                                            Back
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 4 }}>
                                    <TouchableOpacity onPress={startBuat} style={[styles.footerContainer, { backgroundColor: '#1C5FB6' }]}>
                                        <Image
                                            source={require('../../image/Send_hor.png')}
                                            style={styles.logo}
                                        />
                                        <Text style={[styles.footerText2, { color: '#FFFFFF' }]} underlineColorAndroid={"transparent"}>
                                            START
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    {/* Footer End  */}
                </SafeAreaView>
            )}
            
            {isScanning === false && (   
                <>
                    {/* Drawer Notif Start  */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showDrawer}
                        onRequestClose={closeDrawer}
                    >
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            activeOpacity={1}
                            onPress={closeDrawer}
                        >
                            <View style={styles.rightDrawerContainerChecksheet}>
                                <Text style={styles.notifTopText}>
                                    Notifikasi
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flex: 1, height: 0.8, backgroundColor: '#A2A2A7', margin: 8, opacity: 0.4, transform: [{ translateX: 0 }, { translateY: 0 }] }} />
                                </View>
                                <ChecksheetNotifListing data={notifications} />
                            </View>
                        </TouchableOpacity>
                    </Modal>
                    {/* Drawer Notif End  */}
                </>
             )}
        </DrawerSceneWrapper>
    );
};

export default ChecksheetTipe;