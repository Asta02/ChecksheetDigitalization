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
    BackHandler,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import ChecksheetListingItemDetail from '../../components/ListingChecksheetDetail';
import ChecksheetListingItemSearch from '../../components/ListingChecksheetSearch';
import ChecksheetNotifListing from '../../components/NotifChecksheet';
import DrawerSceneWrapper from '../../components/DrawerSceneWrapper';
import styles from '../../styles';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
DropDownPicker.setListMode("SCROLLVIEW");
import { sampleData } from '../../utils/sampleData';

const ChecksheetSaya = ({ navigation }) => {
    const { openDrawer } = navigation;

    const [showDrawer, setShowDrawer] = useState(false);
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
    const [selectedItem, setSelectedItem] = useState('Semua');
    const [startIndex, setStartIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAscending, setIsAscending] = useState(true);
    const [isFilter, setIsFilter] = useState(false);
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

    const closeDrawer = () => {
        setShowDrawer(false);
    };

    const SelectableItem = ({ label, onPress, isSelected }) => (
        <TouchableOpacity
            style={[styles.item, isSelected]}
            onPress={onPress}
        >
            <View style={{ paddingHorizontal: 0, paddingVertical: 20 }}>
                    <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
                        {label}
                    </Text>
            </View>
        </TouchableOpacity>
    );

    useEffect(() => {
        // Call setStartIndex(0) whenever selectedItem changes
        setStartIndex(0);
    }, [selectedItem]);

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

    const CustomButton = ({ onPress }) => {
        return (
            <TouchableOpacity onPress={buatChecksheet} style={styles.button}>
                <View style={styles.iconContainer}>
                    <Icon name="add" size={18} color="#ffffff" />
                </View>
                <Text style={styles.buttonText}>Buat Checksheet</Text>
            </TouchableOpacity>
        );
    };

    const buatChecksheet = () => {
        navigation.replace('drawer', { screen: 'buatchecksheet' });
    };

    const handleSearchClick = () => {
        setIsModalVisible(true);
    };

    const [transformedData, setTransformedData] = useState(sampleData);
    const [transformedDataTemp, setTransformedDataTemp] = useState(sampleData);
    const [filteredDataSearch, setFilteredDataSearch] = useState(sampleData);
    const [searchText, setSearchText] = useState('');
    const fetchData = async () => {
        try {
            const npk = await AsyncStorage.getItem('userNPK');
            const response = await fetch(`http://10.19.101.166:3003/getChecksheet/${npk}`);
            if (!response.ok) {
                throw new Error('Failed to fetch checksheet data');
            }
            const checksheetData = await response.json();

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

            setTransformedData(transformedData);
            setTransformedDataTemp(transformedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
            setRefreshing(false);
        }
    };
    // Fetch data on initial load
    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (text) => {
        setSearchText(text);
        const newData = transformedDataTemp.filter(item => {
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

    const handleNotificationClick = () => {
        setShowDrawer(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleNextPage = (index) => {
        const newStartIndex = index * 6;
        if (newStartIndex < filteredData.length) {
            setStartIndex(newStartIndex);
        } else {
            const maxStartIndex = Math.max(filteredData.length - 6, 0);
            setStartIndex(maxStartIndex);
        }
    };

    const handleNextPageArrow = () => {
        if (startIndex + 6 < filteredData.length) {
            setStartIndex(startIndex + 6);
        }
    };

    const handlePreviousPage = () => {
        if (startIndex >= 6) {
            setStartIndex(startIndex - 6);
        }else{
            setStartIndex(0);
        }
    };

    const renderNumberButtons = () => {
        const buttons = [];
        const totalPages = Math.ceil(filteredData.length / 6);

        const currentColumn = Math.floor(startIndex / 6) + 1;

        let startButtonIndex = currentColumn === 1 ? 0 : (currentColumn - 2) * 3;

        let endButtonIndex = startButtonIndex + 2;

        if (endButtonIndex >= totalPages) {
            endButtonIndex = totalPages - 1;
            startButtonIndex = Math.max(0, endButtonIndex - 2);
        }

        for (let i = startButtonIndex; i <= endButtonIndex; i++) {
            const buttonStyle = i === currentColumn - 1 ? [styles.loadMoreButton, styles.activeButton] : styles.loadMoreButton;
            buttons.push(
                <TouchableOpacity key={i} onPress={() => handleNextPage(i)} style={[buttonStyle, { }]}>
                    <Text style={styles.loadMoreButtonText}>{i + 1}</Text>
                </TouchableOpacity>
            );
        }
        return buttons;
    };

    const filteredData = transformedData.filter(item => {
        switch (selectedItem) {
            case 'Draft':
                return item.status === 0;
            case 'Menunggu TTD':
                return item.status === 1 || item.status === 2;
            case 'Selesai':
                return item.status === 3 || item.status === 4;
            case 'Cancelled':
                return item.status === 5;
            default:
                return true;
        }
    });

    const endIndex = Math.min(startIndex + 6, filteredData.length);
    const countText = filteredData.length === 0
        ? `0 to 0 of 0 entries`
        : `${startIndex + 1} to ${Math.min(endIndex, filteredData.length)} of ${filteredData.length} entries`;

    const sorting = () => {
        const sortedData = [...transformedData].sort((a, b) => {
            if (isAscending) {
                return new Date(a.tanggal) - new Date(b.tanggal);
            } else {
                return new Date(b.tanggal) - new Date(a.tanggal);
            }
        });
        setTransformedData(sortedData);
        setIsAscending(!isAscending);
    };

    const filtering = () => {
        setIsFilter(!isFilter);
    };

    //for dropdown filter
    const [openTipeChecksheet, setOpenTipeChecksheet] = useState(false);
    const [valueTipeChecksheet, setValueTipeChecksheet] = useState('');
    const [itemsTipeChecksheet, setItemsTipeChecksheet] = useState([]);
    useEffect(() => {
        const fetchTipeChecksheet = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getForm', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                const updatedItems = data.map(item => ({
                    label: item.kode_checksheet,
                    value: item.kode_checksheet,
                }));

                setItemsTipeChecksheet(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchTipeChecksheet();
    }, []);
    const [openShift, setOpenShift] = useState(false);
    const [valueShift, setValueShift] = useState('');
    const [itemsShift, setItemsShift] = useState([]);
    useEffect(() => {
        const fetchShift = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getShift', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                const updatedItems = data.map(item => ({
                    label: item.shift_name,
                    value: item.shift_id.toString(),
                }));

                setItemsShift(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchShift();
    }, []);
    const [openTipeBattery, setOpenTipeBattery] = useState(false);
    const [valueTipeBattery, setValueTipeBattery] = useState('');
    const [itemsTipeBattery, setItemsTipeBattery] = useState([]);
    useEffect(() => {
        const fetchTipeBattery = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getTypeBattery', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                const updatedItems = data.map(item => ({
                    label: item.FirstSubstring,
                    value: item.FirstSubstring,
                }));

                setItemsTipeBattery(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchTipeBattery();
    }, []);
    const [openStatus, setOpenStatus] = useState(false);
    const [valueStatus, setValueStatus] = useState('');
    const [itemsStatus, setItemsStatus] = useState([
        { label: 'Draft', value: 'Draft' },
        { label: 'Menunggu TTD Leader', value: 'Menunggu TTD Leader' },
        { label: 'Menunggu TTD Kasubsie', value: 'Menunggu TTD Kasubsie' },
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Selesai dengan Issue', value: 'Selesai dengan Issue' },
        { label: 'Cancelled', value: 'Cancelled' },
    ]);

    const resetFilter = () => {
        setOpenStatus(false);
        setOpenShift(false);
        setOpenTipeChecksheet(false);
        setOpenTipeBattery(false);
        setValueTipeChecksheet('')
        setDate(null);
        setValueShift('')
        setValueTipeBattery('')
        setValueStatus('')
        setTransformedData(transformedDataTemp);
    }
    const searchFilter = () => {
        const filteredData = transformedDataTemp.filter(item => {
            const isMatchTipeChecksheet = valueTipeChecksheet ? (item.kode && item.kode.toLowerCase() === valueTipeChecksheet.toLowerCase()) : true;
            const isMatchDate = date ? (item.tanggal && item.tanggal === date.toDateString()) : true;
            const isMatchShift = valueShift ? (item.shift && item.shift.toLowerCase() === valueShift.toLowerCase()) : true;
            const isMatchTipeBattery = valueTipeBattery ? (item.type && item.type.toLowerCase() === valueTipeBattery.toLowerCase()) : true;
            const statusText = getStatusText(item.status);
            const isMatchStatus = valueStatus ? (statusText.toLowerCase() === valueStatus.toLowerCase()) : true;

            return isMatchTipeChecksheet && isMatchDate && isMatchShift && isMatchTipeBattery && isMatchStatus;
        });

        setTransformedData(filteredData);
    };


    const [date, setDate] = useState(null);
    const [show, setShow] = useState(false);
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(false);
        setDate(currentDate);
    };

    const showDatepicker = () => {
        setShow(true);
    };

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
        <DrawerSceneWrapper>
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
                        <TouchableOpacity onPress={handleSearchClick}>
                            <Icon style={styles.iconSpacingDashboard} name="search" size={30} color="#fff" />
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
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >

                    {/* Label di bawah header start */}
                    <View style={styles.itemContainerChecksheet}>
                        <SelectableItem
                            label="Semua"
                            onPress={() => setSelectedItem('Semua')}
                            isSelected={selectedItem === 'Semua'}
                        />
                        <SelectableItem
                            label="Draft"
                            onPress={() => setSelectedItem('Draft')}
                            isSelected={selectedItem === 'Draft'}
                        />
                        <SelectableItem
                            label="Menunggu TTD"
                            onPress={() => setSelectedItem('Menunggu TTD')}
                            isSelected={selectedItem === 'Menunggu TTD'}
                        />
                        <SelectableItem
                            label="Selesai"
                            onPress={() => setSelectedItem('Selesai')}
                            isSelected={selectedItem === 'Selesai'}
                        />
                        <SelectableItem
                            label="Cancelled"
                            onPress={() => setSelectedItem('Cancelled')}
                            isSelected={selectedItem === 'Cancelled'}
                        />
                        <CustomButton />
                    </View>
                    {/* Label di bawah header end */}

                    <View style={[styles.ChecksheetWrapper]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.topLeftBoxText, { transform: [{ translateX: -12 }, { translateY: -6 }] }]}>
                                Checksheet Saya
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', fontFamily:'rubik' }}>
                                <TouchableOpacity onPress={filtering} style={{ flexDirection: 'row' }} >
                                    <Text style={{ fontSize: 13, color: "#2B6ED3", transform: [{ translateX: -6 }] }}>
                                        Filter
                                    </Text>
                                    <Icon name={isFilter ? "filter-list-off" : "filter-list"} size={16} color="#2B6ED3" style={{ marginLeft: 0, transform: [{ translateX: -6 }, { translateY: 2 }] }} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 13, color: "#313650", transform: [{ translateX: 0 }] }}>
                                    Urutkan:
                                </Text>
                                <TouchableOpacity onPress={sorting} style={{paddingLeft:0, flexDirection:'row'}}>
                                    <Text style={{ fontSize: 13, color: "#2B6ED3", transform: [{ translateX: 0 }] }}>
                                        {" "}Tanggal
                                    </Text>
                                    <Icon
                                        name={isAscending ? "keyboard-double-arrow-down" : "keyboard-double-arrow-up"}
                                        size={14}
                                        color="#2B6ED3"
                                        style={{ marginLeft: 0, transform: [{ translateX: 0 }, { translateY: 4 }] }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {isFilter ? (
                        <View style={styles.filterChecksheetSayaBox}>
                            <View style={styles.topDropdownsFilter}>
                                <DropDownPicker
                                    open={openTipeChecksheet}
                                    value={valueTipeChecksheet}
                                    items={itemsTipeChecksheet}
                                    setOpen={setOpenTipeChecksheet}
                                    setValue={setValueTipeChecksheet}
                                    setItems={setItemsTipeChecksheet}
                                    searchable={true}
                                    placeholder="-- Pilih Tipe Checksheet --"
                                    placeholderStyle={styles.placeholderFilterChecksheetSaya}
                                    style={{ backgroundColor: '#ffffff', borderColor: 'rgba(168,168,172,1)', height: 50 }}
                                    containerStyle={[styles.containerFilterChecksheetSaya, { flex: 1 }]}
                                    itemStyle={{
                                        justifyContent: 'flex-start',
                                    }}
                                    dropDownContainerStyle={{
                                        backgroundColor: '#ffffff',
                                        maxHeight: 110,
                                    }}
                                    zIndex={10}
                                />
                                <TouchableOpacity onPress={showDatepicker} style={styles.datePickerContainer}>
                                    <Text style={styles.placeholderFilterChecksheetSaya}>
                                        {date ? date.toDateString() : '-- Pilih tanggal --'}
                                    </Text>
                                </TouchableOpacity>
                                {show && (
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={onChange}
                                        style={styles.dateTimePicker}
                                    />
                                )}
                                <DropDownPicker
                                    open={openShift}
                                    value={valueShift}
                                    items={itemsShift}
                                    setOpen={setOpenShift}
                                    setValue={setValueShift}
                                    setItems={setItemsShift}
                                    searchable={true}
                                    placeholder="-- Pilih Shift --"
                                    containerStyle={[styles.containerFilterChecksheetSaya, { flex: 1, marginRight:0 }]}
                                    placeholderStyle={styles.placeholderFilterChecksheetSaya}
                                    style={{ backgroundColor: '#ffffff', borderColor: 'rgba(168,168,172,1)', height: 50 }}
                                    itemStyle={{
                                        justifyContent: 'flex-start',
                                    }}
                                    dropDownContainerStyle={{
                                        backgroundColor: '#ffffff',
                                        maxHeight: 110,
                                    }}
                                    zIndex={10}
                                />
                            </View>
                            <View style={styles.bottomButtonsFilter}>
                                <View style={styles.bottomDropdownsFilter}>
                                    <DropDownPicker
                                        open={openTipeBattery}
                                        value={valueTipeBattery}
                                        items={itemsTipeBattery}
                                        setOpen={setOpenTipeBattery}
                                        setValue={setValueTipeBattery}
                                        setItems={setItemsTipeBattery}
                                        searchable={true}
                                        placeholder="-- Pilih Tipe Battery --"
                                        containerStyle={[styles.containerFilterChecksheetSaya, { flex: 3}]}
                                        placeholderStyle={styles.placeholderFilterChecksheetSaya}
                                        style={{ backgroundColor: '#ffffff', borderColor: 'rgba(168,168,172,1)', height: 50 }}
                                        itemStyle={{
                                            justifyContent: 'flex-start',
                                        }}
                                        dropDownContainerStyle={{
                                            backgroundColor: '#ffffff',
                                            maxHeight: 110,
                                        }}
                                        zIndex={9}
                                    />
                                    <DropDownPicker
                                        open={openStatus}
                                        value={valueStatus}
                                        items={itemsStatus}
                                        setOpen={setOpenStatus}
                                        setValue={setValueStatus}
                                        setItems={setItemsStatus}
                                        searchable={true}
                                        placeholder="-- Pilih Status --"
                                        containerStyle={[styles.containerFilterChecksheetSaya, { flex: 3, marginRight:0}]}
                                        placeholderStyle={styles.placeholderFilterChecksheetSaya}
                                        style={{ backgroundColor: '#ffffff', borderColor: 'rgba(168,168,172,1)', height: 50 }}
                                        itemStyle={{
                                            justifyContent: 'flex-start',
                                        }}
                                        dropDownContainerStyle={{
                                            backgroundColor: '#ffffff',
                                            maxHeight: 110,
                                        }}
                                        zIndex={9}
                                    />
                                    <TouchableOpacity onPress={searchFilter} style={[styles.buttonFilter, styles.bigButton, { flex: 2 }]}>
                                        <Text style={styles.buttonTextFilter}><Icon name="search" size={24} color="#FFFFFF" style={{ marginLeft: 0, transform: [{ translateX: -6 }, { translateY: 2 }] }} /></Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={resetFilter} style={[styles.buttonFilter, { flex: 1, backgroundColor: "#ECF0F5", borderColor: "#1B58B0", borderWidth:1 }]}>
                                        <Text style={styles.buttonTextFilter}><Icon name="delete" size={24} color="#1B58B0" style={{ marginLeft: 0, transform: [{ translateX: -6 }, { translateY: 2 }] }} /></Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        ) : null}
                        <FlatList
                            style={{ transform: openStatus || openTipeBattery  ? [{ translateY: 70 }] : [{ translateY: 0 }] }}
                            zIndex={8}
                            showsVerticalScrollIndicator={false}
                            data={filteredData.slice(startIndex, startIndex + 6)}
                            renderItem={({ item }) => <ChecksheetListingItemDetail {...item} />}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4, paddingHorizontal: 4 }}>
                            <Text style={{color: '#A2A2A7', fontFamily: 'rubik', transform: isFilter ? (openStatus || openTipeBattery) ? [{ translateY: 70 }] : [{ translateY: 0 }] : [{ translateY: 0 }] }}>
                                {countText}
                            </Text>
                            <View style={{ flexDirection: 'row', transform: isFilter ? (openStatus || openTipeBattery) ? [{ translateY: 70 }] : [{ translateY: 0 }] : [{ translateY: 0 }] }}>
                                {/* Previous button */}
                                <TouchableOpacity onPress={handlePreviousPage} style={[styles.loadMoreButton, { borderRadius: 0 }]}>
                                    <Text style={styles.loadMoreButtonText}>{'<'}</Text>
                                </TouchableOpacity>

                                {/* Number buttons */}
                                {renderNumberButtons()}

                                {/* Next button */}
                                <TouchableOpacity onPress={handleNextPageArrow} style={[styles.loadMoreButton, { borderRadius: 0 }]}>
                                    <Text style={styles.loadMoreButtonText}>{'>'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Modal Search Start  */}
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
                {/* Modal Search End  */}

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
            </SafeAreaView>
        </DrawerSceneWrapper>
    );
};

export default ChecksheetSaya;
