import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Image,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import ChecksheetListingItem from '../../components/ListingChecksheet';
import ChecksheetListingItemSearch from '../../components/ListingChecksheetSearch';
import ChecksheetNotifListing from '../../components/NotifChecksheet';
import DrawerSceneWrapper from '../../components/DrawerSceneWrapper';
import styles from '../../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import { sampleData } from '../../utils/sampleData';

const Dashboard = ({ navigation }) => {
        
    // const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [refreshing, setRefreshing] = useState(true);

    const onRefresh = React.useCallback(() => {
        if (refreshing) {
            return; // Exit early if already refreshing
        }
        setRefreshing(true); 

        fetchData().then(() => {
            setRefreshing(false);
        });
    }, [refreshing]);


    const buatChecksheet = () => {
        navigation.replace('drawer', { screen: 'buatchecksheet' });
    };

    const checksheetSaya = () => {
        navigation.replace('drawer', { screen: 'dashboard' });
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const closeDrawer = () => {
        setShowDrawer(false);
    };

    const handleSearchClick = () => {
        setIsModalVisible(true);
    };

    const handleNotificationClick = () => {
        setShowDrawer(true);
    };

    // const handleKeyboardOpen = () => {
    //     setIsKeyboardOpen(true);
    // };

    // const handleKeyboardClose = () => {
    //     setIsKeyboardOpen(false);
    // };

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




    const [transformedData, setTransformedData] = useState(sampleData);
    const [filteredDataSearch, setFilteredDataSearch] = useState(sampleData);
    const [searchText, setSearchText] = useState('');
    const fetchData = async () => {
        try {
            const npk = await AsyncStorage.getItem('userNPK');
            // Fetch checksheet data
            const response = await fetch(`http://10.19.101.166:3003/getChecksheet/${npk}`);
            if (!response.ok) {
                throw new Error('Failed to fetch checksheet data');
            }
            const checksheetData = await response.json();

            // Transform data
            const transformedData = checksheetData.map(item => ({
                id: item.id_checksheettransaction,
                kode: item.kode_checksheet,
                title: item.nama_form,
                brand: item.brand_battery,
                type: item.type_battery,
                customer: item.customer,
                status: item.checksheetTransaction_status,
                tanggal: item.checksheet_modifDate ? new Date(item.checksheet_modifDate).toISOString() : null,
                shift: item.shift,
            }));

            // Set transformed data and filtered data
            setTransformedData(transformedData);

            // Retry fetch if data isn't loaded in 5 seconds
            setTimeout(() => {
                if (transformedData.length === 0) {
                    fetchData();
                }
            }, 5000);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally{
            setRefreshing(false);
        }
    };

    // Fetch data on initial load
    useEffect(() => {
        fetchData();
    }, []);


    const handleSearch = (text) => {
        setSearchText(text);
        const newData = transformedData.filter(item => {
            const statusText = getStatusText(item.status);
            return (
                (item.kode && item.kode.toLowerCase().includes(text.toLowerCase())) ||
                (item.title && item.title.toLowerCase().includes(text.toLowerCase())) ||
                (item.brand && item.brand.toLowerCase().includes(text.toLowerCase())) ||
                (item.type && item.type.toLowerCase().includes(text.toLowerCase())) ||
                (item.customer && item.customer.toLowerCase().includes(text.toLowerCase())) ||
                (statusText && statusText.toLowerCase().includes(text.toLowerCase())) ||
                (item.tanggal && item.tanggal.toLowerCase().includes(text.toLowerCase()))
            );
        });
        setFilteredDataSearch(newData);
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return "Draft";
            case 1:
                return "Menunggu TTD Leader";
            case 2:
                return "Menunggu TTD Kasubsie";
            case 3:
                return "Selesai";
            case 4:
                return "Selesai dengan Issue";
            case 5:
                return "Cancelled";
            default:
                return "";
        }
    };

    const [namaLengkap, setNamaLengkap] = useState('Loading...');
    const [userNPK, setUserNPK] = useState('Loading...');
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        const retrieveEmpId = async () => {
            try {
                const userNPK = await AsyncStorage.getItem('userNPK');
                const photo = await AsyncStorage.getItem('photo');
                const tempNamaLengkap = await AsyncStorage.getItem('namaLengkap');

                if (userNPK === null || userNPK === '') {
                    try {
                        const empId = await AsyncStorage.getItem('emp_id');
                        if (empId !== null) {
                            const loadResponse = await fetch(`http://10.19.101.166:3003/getEmpData/${empId}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                            });

                            if (!loadResponse.ok) {
                                throw new Error('Failed to load data');
                            }

                            const empData = await loadResponse.json();

                            if (empData.length > 0) {
                                const item = empData[0];
                                const tempNamaLengkap = item.user_namafull;
                                const userNPK = item.user_npk;

                                await AsyncStorage.setItem('namaLengkap', tempNamaLengkap);
                                await AsyncStorage.setItem('userNPK', userNPK);

                                setNamaLengkap(tempNamaLengkap);
                                setUserNPK(userNPK);
                            }
                        } else {
                            console.log('No emp_id found in AsyncStorage.');
                        }
                    } catch (error) {
                        console.error('Error loading data:', error);
                    }
                }

                setNamaLengkap(tempNamaLengkap);
                setUserNPK(userNPK);
                setPhoto(photo);
            } catch (error) {
                console.error('Error retrieving data from AsyncStorage:', error);
            }
        };

        retrieveEmpId();
    }, []);


    return (
        <DrawerSceneWrapper>
            <SafeAreaView style={styles.container}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <LinearGradient
                        colors={['#1C5FB6', '#043987']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.header2}
                    >
                        <View style={styles.iconContainerDashboard2Left}>
                            <View style={[styles.circularImageContainerProfile]}>
                                <Image
                                    source={
                                        photo ? { uri: `https://portalgs.gs.astra.co.id/foto/emp_photos/${photo}` }
                                            : require('../../image/Round.png')
                                    }
                                    style={styles.circularImage}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.profileText}>
                                <Text style={{ color: '#ffff', opacity: 0.6 }}>Selamat datang kembali.</Text>
                                <Text style={{ color: '#ffff', fontWeight: 'bold' }}>{namaLengkap} / {userNPK}</Text>
                            </View>
                        </View>
                        <View style={styles.iconContainerDashboard2Right}>
                            <TouchableOpacity onPress={handleSearchClick}>
                                <Icon style={styles.iconSpacingDashboard} name="search" size={32} color="#fff" />
                            </TouchableOpacity>
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
                        </View>
                    </LinearGradient>
                    <View style={styles.wrapperIndex}>
                        <View style={styles.rectangleBox}>
                            <View style={styles.topTextContainer}>
                                <Text style={styles.topLeftBoxText}>Menu Utama</Text>
                                <Text style={styles.topRightBoxText}>
                                    Anda memiliki
                                    {' '}
                                    <Text style={{ color: '#2B6ED3', textDecorationLine: 'underline', fontSize: 16 }}>
                                        {transformedData.filter(item => item.status === 0 || item.status === 1 || item.status === 2).length}
                                    </Text>
                                    {' '}
                                    checksheet aktif
                                </Text>
                            </View>
                            <View style={styles.bottomBoxContainer}>
                                <LinearGradient
                                    colors={['#1C5FB6', '#253ec3']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    locations={[0, 1]}
                                    style={[styles.bottomBox]}
                                >
                                    <TouchableOpacity onPress={buatChecksheet}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
                                            <Icon name="edit" size={20} color="#253ec3" style={styles.iconBox} />
                                        </View>
                                        <Text style={styles.bottomBoxText}>Buat Checksheet</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                                <LinearGradient
                                    colors={['#2ab2d2', '#2389c3']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    locations={[0.1, 1]}
                                    style={[styles.bottomBox]}
                                >
                                    <TouchableOpacity onPress={checksheetSaya}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
                                            <Icon name="inbox" size={20} color="#2BB4D3" style={styles.iconBox} />
                                        </View>
                                        <Text style={styles.bottomBoxText}>Checksheet Saya</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.wrapperIndex]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[styles.topLeftBoxText, { transform: [{ translateX: -12 }, { translateY: -6 },] }]}>
                                Checksheet Terbaru Saya
                            </Text>
                            <TouchableOpacity onPress={checksheetSaya} >
                                <Text style={{ fontSize: 13, color: "#2B6ED3", transform: [{ translateX: -6 }, { translateY: 20 }] }}>
                                    Lihat Semua
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={transformedData.slice(0, 5)}
                            renderItem={({ item }) => <ChecksheetListingItem {...item} />}
                        />
                    </View>

                </ScrollView>

                {/* Modal Search Start */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={closeModal}
                >
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={closeModal}
                    >
                        <View style={styles.searchmodalContainer}>
                            <View style={styles.searchmodalContent}>
                                <Text style={[styles.modalSearchLeftBoxText, { transform: [{ translateY: -16 }] }]}>
                                    Cari Checksheet
                                </Text>
                                <View style={styles.inputContainerModalSearch}>
                                    <Icon style={styles.iconModalSearch} name="search" size={20} />
                                    <TextInput
                                        style={{ flex: 1, opacity: 0.8, color: 'black' }}
                                        placeholder="Search..."
                                        placeholderTextColor="#a2a2a7"
                                        autoCapitalize="none"
                                        underlineColorAndroid="transparent"
                                        value={searchText}
                                        onChangeText={handleSearch}
                                    />
                                </View>
                                <Text style={{ color: '#A2A2A7', fontSize: 16, marginRight: 294, marginTop: 2, marginBottom: 2, paddingBottom: 2, transform: [{ translateX: -2 }, { translateY: -10 }] }}>
                                    Ditemukan {filteredDataSearch.length} file yang cocok
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flex: 1, height: 1.6, backgroundColor: '#A2A2A7', marginRight: 8, opacity: 0.4, transform: [{ translateX: 0 }, { translateY: -12 }] }} />
                                </View>
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    data={filteredDataSearch}
                                    renderItem={({ item }) => <ChecksheetListingItemSearch {...item} />}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
                {/* Modal Search End */}

                {/* Drawer Notif Start */}
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
                        <View style={styles.rightDrawerContainer}>
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
                {/* Drawer Search End */}
            </SafeAreaView>
        </DrawerSceneWrapper>
    );
};

export default Dashboard;
