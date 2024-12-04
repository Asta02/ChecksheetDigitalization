import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    ToastAndroid,
    TextInput,
    BackHandler,
    Platform,
    Dimensions,
    LogBox
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler'
import { launchImageLibrary } from 'react-native-image-picker';
import StepIndicator from 'react-native-step-indicator';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { sampleData } from '../../utils/sampleData';
import DrawerSceneWrapper from '../../components/DrawerSceneWrapper';
import styles from '../../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Signature from 'react-native-signature-canvas';
import ChecksheetNotifListing from '../../components/NotifChecksheet';

const { width, height } = Dimensions.get("window");
DropDownPicker.setListMode("SCROLLVIEW");


const ChecksheetTungguttd = ({ navigation, route }) => {
    const { id, status } = route.params;
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
    const [empIdOfFirstObject, setEmpIdOfFirstObject] = useState(null);
    const [empIdOfFirstObjectLeader, setEmpIdOfFirstObjectLeader] = useState(null);
    const [empIdOfFirstObjectKasubsi, setEmpIdOfFirstObjectKasubsi] = useState(null);

    const [data, setData] = useState([]);
    const [shiftName, setShiftName] = useState(null);
    useEffect(() => {
        const loadData = async () => {
            try {
                const loadResponse = await fetch(`http://10.19.101.166:3003/getChecksheetDetail/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!loadResponse.ok) {
                    throw new Error('Failed to load data');
                }

                const fetchedData = await loadResponse.json();
                const formattedData = fetchedData.map(item => {
                    const tgl_ttdoperator_date = new Date(item.tgl_ttdoperator);
                    const tgl_ttdleader_date = item.tgl_ttdleader ? new Date(item.tgl_ttdleader) : null;
                    const tgl_ttdkasubsi_date = item.tgl_ttdkasubsi ? new Date(item.tgl_ttdkasubsi) : null;

                    tgl_ttdoperator_date.setHours(tgl_ttdoperator_date.getHours() - 7);

                    if (tgl_ttdleader_date) {
                        tgl_ttdleader_date.setHours(tgl_ttdleader_date.getHours() - 7);
                    }

                    if (tgl_ttdkasubsi_date) {
                        tgl_ttdkasubsi_date.setHours(tgl_ttdkasubsi_date.getHours() - 7);
                    }

                    return {
                        ...item,
                        tgl_check: new Date(item.tgl_check).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        }),
                        tgl_delivery: new Date(item.tgl_delivery).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        }),
                        tgl_ttdoperator: tgl_ttdoperator_date.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        tgl_ttdleader: tgl_ttdleader_date ? tgl_ttdleader_date.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        }) : null,
                        tgl_ttdkasubsi: tgl_ttdkasubsi_date ? tgl_ttdkasubsi_date.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        }) : null,
                    };
                });

                setData(formattedData);
                if (formattedData.length > 0) {
                    setEmpIdOfFirstObject(formattedData[0].emp_id);
                    setEmpIdOfFirstObjectLeader(formattedData[0].emp_id_leader);
                    setEmpIdOfFirstObjectKasubsi(formattedData[0].emp_id_kasubsi);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, [id]);
    useEffect(() => {
        if (data.length > 0) {
            const idShift = data[0].shift;
            const fetchShift = async () => {
                try {
                    const loadResponse = await fetch(`http://10.19.101.166:3003/getShiftByChecksheet/${idShift}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });

                    if (!loadResponse.ok) {
                        throw new Error('Failed to load data');
                    }

                    const fetchedData = await loadResponse.json();
                    setShiftName(fetchedData[0].shift_name);
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            };

            fetchShift();
        }
    }, [data]);

    const [namaOperator, setNamaOperator] = useState('Loading...');
    const [npkOperator, setNpkOperator] = useState('Loading...');
    useEffect(() => {
        const loadEmpData = async () => {
            try {
                if (empIdOfFirstObject) {
                    const loadResponse = await fetch(`http://10.19.101.166:3003/getEmpData/${empIdOfFirstObject}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });

                    if (!loadResponse.ok) {
                        throw new Error('Failed to load data');
                    }

                    const fetchedData = await loadResponse.json();
                    const firstObject = fetchedData[0];
                    setNamaOperator(firstObject.Full_Name);
                    setNpkOperator(firstObject.user_npk);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        if (empIdOfFirstObject !== null) {
            loadEmpData();
        }
    }, [empIdOfFirstObject]);

    const [namaLeader, setNamaLeader] = useState('Loading...');
    const [npkLeader, setNpkLeader] = useState('Loading...');
    useEffect(() => {
        const loadEmpDataLeader = async () => {
            try {
                if (empIdOfFirstObject) {
                    const loadResponse = await fetch(`http://10.19.101.166:3003/getEmpData/${empIdOfFirstObjectLeader}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });

                    if (!loadResponse.ok) {
                        throw new Error('Failed to load data');
                    }

                    const fetchedData = await loadResponse.json();
                    const firstObject = fetchedData[0];
                    setNamaLeader(firstObject.Full_Name);
                    setNpkLeader(firstObject.user_npk);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        if (empIdOfFirstObjectLeader) {
            loadEmpDataLeader();
        }
    }, [empIdOfFirstObjectLeader]);


    const [namaKasubsi, setNamaKasubsi] = useState('Loading...');
    const [npkKasubsi, setNpkKasubsi] = useState('Loading...');
    useEffect(() => {
        const loadEmpDataKasubsi = async () => {
            try {
                if (empIdOfFirstObject) {
                    const loadResponse = await fetch(`http://10.19.101.166:3003/getEmpData/${empIdOfFirstObjectKasubsi}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });

                    if (!loadResponse.ok) {
                        throw new Error('Failed to load data');
                    }

                    const fetchedData = await loadResponse.json();
                    const firstObject = fetchedData[0];
                    setNamaKasubsi(firstObject.Full_Name);
                    setNpkKasubsi(firstObject.user_npk);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        if (empIdOfFirstObjectLeader) {
            loadEmpDataKasubsi();
        }
    }, []);

    const handleNotificationClick = () => {
        setShowDrawer(true);
    };

    const openDrawer = () => {
        navigation.openDrawer();
    };

    const closeDrawer = () => {
        setShowDrawer(false);
    };

    const [selectedItem, setSelectedItem] = useState('Battery Information');
    const stepLabelsMap = {
        'Battery Information': ["Brand Battery *", "Item Number *", "Type Battery *", "No Dok PCB *", "Negara Tujuan (Khusus Export) *", "Customer *"],
        'Packing': ["Jumlah Battery/Pallet *", "Kondisi Susunan battery", "Kondisi Ikatan", "Type Pallet / No *", "Tampilan pallet", "Styrophore/Karton/Triplex *", "Inspection Tag", "Shiping Mark", "Label Produksi", "Plastik shrink", "Kesesuaian tag, label dan item number"],
        'Cover': ["Type Battery *", "Warna Cover *", "Tampilan Terminal", "Brand Mark *", "Tampilan Cover", "Kode Finishing *", "Kode Produksi *", "Sticker *", "Type vent plug *", "Warna Vent Plug *", "Tampilan Vent Plug", "Indicator Electrolite"],
        'Container': ["Warna Container *", "Mark Brand ( Print ) *", "Mark Type ( Print ) *", "Upper / Lower Level ( Print )", "Tampilan Container", "Sticker *"],
        'Master Box / K.Box': ["Tampilan kabo", "Sticker *", "Mark Brand *", "Mark Type *", "Mark Spec *", "Instruction Manual (sisi pendek)", "Stamp *", "Isolasi"],
        'Accessories': ["Warranty Card *", "Instruction Manual (label) *", "Elbow"]
    };
    const placeholderValues = {
        'Battery Information': {
            standard: ["-", "-", "-", "-", "-", "-"],
            actual: data.length > 0 ? [
                data[0].brand_battery || "-",
                data[0].item_number || "Loading...",
                data[0].type_battery || "Loading...",
                data[0].no_dok_pcb || "-",
                data[0].batteryNegaraTujuan || "-",
                data[0].customer || "-"
            ] : Array(6).fill("Loading...")
        },
        'Packing': {
            standard: data.length > 0 ? [
                data[0].jumlah_batterypalet_standard != null ? data[0].jumlah_batterypalet_standard.toString() : "-",
                "Sesuai standar packing, tidak keluar dari pallet / Over h..",
                "Rapi / tidak miring",
                data[0].type_palletno_standard || "-",
                "Bersih, tidak berjamur, Patah/Retak",
                data[0].styrophore_karton_triplex_standard || "-",
                "Tersedia",
                "Tersedia",
                "Tersedia",
                "Tidak basah",
                "Sesuai"
            ] : Array(11).fill("-"),
            actual: data.length > 0 ? [
                data[0].jumlah_batterypalet_actual != null ? data[0].jumlah_batterypalet_actual.toString() : "-",
                data[0].kondisi_susunanbattery || "-",
                data[0].kondisi_ikatan || "-",
                data[0].type_palletno_actual || "-",
                data[0].tampilan_palet || "-",
                data[0].styrophore_karton_triplex_actual || "-",
                data[0].inspection_tag || "-",
                data[0].shiping_mark || "-",
                data[0].label_produksi || "-",
                data[0].plastik_shrink || "-",
                data[0].kesesuaian_tag || "-"
            ] : Array(11).fill("-")
        },
        'Cover': {
            standard: (
                data.length > 0 ?
                    [
                        data[0].type_battery_standard || "-",
                        data[0].coverWarnaStandard || "-",
                        "Tidak Cacat, tidak bengkok, tidak menghitam",
                        data[0].coverBrandMarkStandard || "-",
                        "Bersih, tidak cacat",
                        "Tersedia",
                        "Tersedia",
                        data[0].coverStickerStandard || "-",
                        data[0].coverTypeVentPlugStandard || "-",
                        data[0].coverWarnaVentPlugStandard || "-",
                        "TIDAK CACAT",
                        "ADA  /  TIDAK ADA"
                    ] :
                    Array(12).fill("Loading...")
            ),
            actual: (
                data.length > 0 ?
                    [
                        data[0].type_battery_actual || "-",
                        data[0].coverWarnaActual || "-",
                        data[0].coverTampilanTerminal || "-",
                        data[0].coverBrandMarkActual || "-",
                        data[0].coverTampilanCover || "-",
                        data[0].coverKodeFinishingActual || "-",
                        data[0].coverKodeProduksi || "-",
                        data[0].coverStickerActual || "-",
                        data[0].coverTypeVentPlugActual || "-",
                        data[0].coverWarnaVentPlugActual || "-",
                        data[0].coverTampilanVentPlug || "-",
                        data[0].coverIndicatorElectrolite || "-"
                    ] :
                    Array(12).fill("Loading...")
            )
        },
        'Container': {
            standard: (
                data.length > 0 ?
                    [
                        data[0].containerWarnaStandard || "-",
                        data[0].containerMarkBrandStandard || "-",
                        data[0].containerMarkTypeStandard || "-",
                        "Tersedia",
                        "BERSIH, tidak cacat",
                        data[0].containerStickerStandard || "-",
                    ] :
                    Array(6).fill("Loading...")
            ),
            actual: (
                data.length > 0 ?
                    [
                        data[0].containerWarnaActual || "-",
                        data[0].containerMarkBrandActual || "-",
                        data[0].containerMarkTypeActual || "-",
                        data[0].containerUpperLowerLevel || "-",
                        data[0].containerTampilan || "-",
                        data[0].containerStickerActual || "-",
                    ] :
                    Array(6).fill("Loading...")
            )
        },
        'Master Box / K.Box': {
            standard: (
                data.length > 0 ?
                    [
                        "Tidak kembung/ penyok/ sobek",
                        data[0].kBoxStickerStandard || "-",
                        data[0].kBoxMarkBrandStandard || "-",
                        data[0].kBoxMarkTypeStandard || "-",
                        data[0].kBoxMarkSpecStandard || "-",
                        "ADA  /  TIDAK ADA",
                        "ADA  /  TIDAK ADA",
                        "Terpasang rapi",
                    ] :
                    Array(8).fill("Loading...")
            ),
            actual: (
                data.length > 0 ?
                    [
                        data[0].kBoxTampilan || "-",
                        data[0].kBoxStickerActual || "-",
                        data[0].kBoxMarkBrandActual || "-",
                        data[0].kBoxMarkTypeActual || "-",
                        data[0].kBoxMarkSpecActual || "-",
                        data[0].kBoxInstructionManual || "-",
                        data[0].kBoxStamp || "-",
                        data[0].kBoxIsolasi || "-"
                    ] :
                    Array(8).fill("Loading...")
            )
        },
        'Accessories': {
            standard: (
                data.length > 0 ?
                    [
                        data[0].warranty_card_standard || "-",
                        data[0].instuction_manual_standard || "-",
                        data[0].elbow_standard || "-",
                    ] :
                    Array(3).fill("Loading...")
            ),
            actual: (
                data.length > 0 ?
                    [
                        data[0].warranty_card_actual || "-",
                        data[0].instuction_manual_actual || "-",
                        data[0].elbow_actual || "-",
                    ] :
                    Array(3).fill("Loading...")
            )
        }
    };


    const SelectableItem = ({ label, onPress, isSelected, backgroundColor }) => {
        let stepsLength = 0;
        if (stepLabelsMap[label]) {
            stepsLength = stepLabelsMap[label].length;
        }

        const handlePress = () => {
            onPress();
        };
        // const progressContainerStyle = position === stepsLength ? styles.progressContainer : styles.progressContainerEmpty;
        // const progressTextStyle = position === stepsLength ? styles.progressText : styles.progressTextEmpty;

        return (
            <TouchableOpacity onPress={handlePress}>
                <View style={[styles.inputContainerBuatChecksheetTtdCancel, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isSelected ? backgroundColor : '#F4F4F4' }]}>
                    <Text style={[styles.listTitle, { fontWeight: 'bold', paddingTop: 0, paddingLeft: 0, marginHorizontal: 4, color: isSelected ? '#ffffff' : '#000' }]}>
                        {label}
                    </Text>
                    <Text style={{ color: isSelected ? '#ffffff' : '#A2A2A7', paddingRight:4, fontSize:18, fontFamily:'rubik'}}>
                        {'>'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };
    
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackPress
        );

        return () => backHandler.remove();
    }, []);

    const handleBackPress = async () => {
        navigation.replace('dashboard');
        return true;
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return "Draft";
            case 1:
                return "Menunggu TTD Leader";
            case 2:
                return "Menunggu TTD Kasubsi";
            case 3:
                return "Selesai";
            case 4:
                return "Issue";
            case 5:
                return "Cancelled";
            default:
                return "";
        }
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


    const highlightAsterisk = (label) => {
        const parts = label.split('*');
        return (
            <Text>
                {parts.map((part, index) => (
                    <Text key={index}>
                        {part}
                        {index < parts.length - 1 && <Text style={{ color: '#dc3545' }}>*</Text>}
                    </Text>
                ))}
            </Text>
        );
    };

    return (
        <DrawerSceneWrapper zIndex={0}>
            <SafeAreaView zIndex={0} style={styles.container}>
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
                    <Text style={[styles.notifTopTextBuatChecksheet, { paddingLeft: 16, }]}>
                        Pre Delivery Check AMB & MCB PRM (RM/EXPORT - BATTERY)
                    </Text>
                    <View style={styles.containerIsiChecksheet}>
                        {/* Left Box */}
                        <View style={styles.leftBoxIsiChecksheet}>
                            {/* Left Box Top Section (40%) */}
                            <View style={[styles.leftBoxTopIsiChecksheet, {height:258}]}>
                                <Text style={styles.topLeftBoxTextBuatChecksheet}>Detail Checksheet</Text>
                                {data.map(item => (
                                    <React.Fragment key={item.id_checksheettransaction}>
                                        <View style={[styles.detailChecksheetBoxTextContainer, { paddingBottom: 0 }]}>
                                            <Text style={styles.detailChecksheetBoxTextLeft}>No. WO</Text>
                                            <Text style={styles.detailChecksheetBoxTextRight}>{item.no_wo}</Text>
                                        </View>
                                        <View style={[styles.detailChecksheetBoxTextContainer, { paddingBottom: 0 }]}>
                                            <Text style={styles.detailChecksheetBoxTextLeft}>Shift</Text>
                                            <Text style={styles.detailChecksheetBoxTextRight}>{shiftName}</Text>
                                        </View>
                                        <View style={[styles.detailChecksheetBoxTextContainer, { paddingBottom: 0, paddingTop: 0 }]}>
                                            <Text style={styles.detailChecksheetBoxTextLeft}>Tanggal Check</Text>
                                            <Text style={styles.detailChecksheetBoxTextRight}>{item.tgl_check}</Text>
                                        </View>
                                        <View style={[styles.detailChecksheetBoxTextContainer, { paddingBottom: 0 }]}>
                                            <Text style={styles.detailChecksheetBoxTextLeft}>Tanggal Delivery</Text>
                                            <Text style={styles.detailChecksheetBoxTextRight}>{item.tgl_delivery}</Text>
                                        </View>
                                    </React.Fragment>
                                ))}
                                <View style={{ borderBottomWidth: 1, borderBottomColor: '#A2A2A7', opacity: 0.2, width: '92%', marginLeft: 10 }}>
                                    {/* this is for line (yang di shift) */}
                                </View>
                                <View style={[styles.detailChecksheetBoxTextContainer, { paddingBottom: 8 }]}>
                                    <Text style={[styles.detailChecksheetBoxTextLeft, {marginTop:2}]}>Status</Text>
                                    <View style={styles.draftContainerDetail}>
                                        <Text style={[
                                            styles.draftText,
                                            status === 0 ? styles.bgSecondary :
                                                status === 1 ? styles.bgPrimary :
                                                    status === 2 ? styles.bgInfo :
                                                        status === 3 ? styles.bgSuccess :
                                                            status === 4 ? styles.bgWarning :
                                                                status === 5 ? styles.bgDanger : null
                                        ]}>
                                            {" " + getStatusText(status) + " "}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {/* Left Box Bottom Section (60%) */}
                            <View style={[styles.leftBoxBottomIsiChecksheet, { height: 469 }]}>
                                <Text style={[styles.topLeftBoxTextBuatChecksheet, { paddingBottom: 10 }]}>Inspection Item</Text>
                                <SelectableItem
                                    label="Battery Information"
                                    onPress={() => setSelectedItem('Battery Information')}
                                    isSelected={selectedItem === 'Battery Information'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                />
                                <SelectableItem
                                    label="Packing"
                                    onPress={() => setSelectedItem('Packing')}
                                    isSelected={selectedItem === 'Packing'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                />
                                <SelectableItem
                                    label="Cover"
                                    onPress={() => setSelectedItem('Cover')}
                                    isSelected={selectedItem === 'Cover'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                />
                                <SelectableItem
                                    label="Container"
                                    onPress={() => setSelectedItem('Container')}
                                    isSelected={selectedItem === 'Container'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                />
                                <SelectableItem
                                    label="Karton Box"
                                    onPress={() => setSelectedItem('Master Box / K.Box')}
                                    isSelected={selectedItem === 'Master Box / K.Box'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                />
                                <SelectableItem
                                    label="Accessories"
                                    onPress={() => setSelectedItem('Accessories')}
                                    isSelected={selectedItem === 'Accessories'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                />
                            </View>
                        </View>
                        {/* Right Box */}
                        <View zIndex={0} style={[styles.rightBoxIsiChecksheetTTD, { alignSelf: 'flex-start', height: 744 }]}>
                            <Text style={styles.topLeftBoxTextBuatChecksheet}>{selectedItem}</Text>
                            <ScrollView zIndex={0} style={{ flexWrap: 'nowrap' }} nestedScrollEnabled={true} scrollEnabled={selectedItem === 'Battery Information' || selectedItem === 'Cover' || selectedItem === 'Packing' || selectedItem === 'Container' || selectedItem === 'Master Box / K.Box' || selectedItem === 'Accessories'} >
                                <View style={{ flexDirection: 'row', flexWrap: 'nowrap' }}>
                                    <View zIndex={0} style={[{ flex: 4, flexWrap: 'nowrap', height: selectedItem === 'Master Box / K.Box' ? 1860 : selectedItem === 'Battery Information' ? 700 : selectedItem === 'Container' ? 1420 : selectedItem === 'Cover' ? 2740 : selectedItem === 'Packing' ? 2420 : selectedItem === 'Accessories' ? 700 : 0, transform: [{ translateY: selectedItem === 'Master Box / K.Box' ? -72 : selectedItem === 'Container' ? -72 : selectedItem === 'Battery Information' ? -72 : selectedItem === 'Cover' ? -72 : selectedItem === 'Packing' ? -72 : selectedItem === 'Accessories' ? -72 : 0 }] }]}>
                                        <View style={[styles.inputContainerChecksheetIsiTTD, { position: 'relative', zIndex: 0 }]}>
                                            {/* Isi dari kotak yang di kanan (di dalam ScrollView) */}
                                            <View zIndex={0}>
                                                {stepLabelsMap[selectedItem].map((label, index) => (
                                                    <View key={index} style={{ transform: [{ translateY: -12 * index }] }}>
                                                        <Text style={[styles.topLeftBoxTextBuatChecksheet, { paddingBottom: 0, transform: [{ translateX: -6 }, { translateY: 10 }], fontSize: 15 }]}>
                                                            {highlightAsterisk(label)}
                                                        </Text>
                                                        {selectedItem !== 'Battery Information' && (
                                                            <>
                                                                <Text style={[styles.standardActualtext, { transform: [{ translateY: 0 }], marginTop: 14 }]}>
                                                                    Standard
                                                                </Text>
                                                                <View zIndex={0} style={[styles.inputContainerForPlaceHolder, { backgroundColor: 'rgba(162, 162, 167, 0.2)' }]}>
                                                                    <TextInput
                                                                        style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                                        placeholder={placeholderValues[selectedItem].standard[index] || "-"}
                                                                        autoCapitalize="none"
                                                                        multiline={true}
                                                                        numberOfLines={null}
                                                                        placeholderTextColor="#000"
                                                                        underlineColorAndroid={"transparent"}
                                                                        editable={false}
                                                                        zIndex={0}
                                                                    />
                                                                </View>
                                                                <Text style={[styles.standardActualtext, { transform: [{ translateY: -10 }] }]}>
                                                                    Actual
                                                                </Text>
                                                            </>
                                                        )}
                                                        <View zIndex={0} style={[styles.inputContainerForPlaceHolder, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: selectedItem !== 'Battery Information' ? -10 : 20 }], marginBottom: selectedItem !== 'Battery Information' ? 0 : 54 }]}>
                                                            <TextInput
                                                                style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                                placeholder={placeholderValues[selectedItem].actual[index] || "-"}
                                                                autoCapitalize="none"
                                                                multiline={true}
                                                                numberOfLines={null}
                                                                placeholderTextColor="#000"
                                                                underlineColorAndroid={"transparent"}
                                                                editable={false}
                                                                zIndex={0}
                                                            />
                                                        </View>
                                                        {index < stepLabelsMap[selectedItem].length - 1 && (
                                                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#A2A2A7', opacity: 0.2, width: '98%', marginLeft: 3, transform: [{ translateY: -10 }] }}></View>
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>     
                    </View>
                    {/* bottom box */}
                    <View style={styles.bottomBoxIsiChecksheetTTD}>
                        <Text style={styles.topTextInBottomBox}>Tanda Tangan</Text>
                        {data.map(item => (
                            <React.Fragment key={item.id_checksheettransaction}>
                                {/* ke arah kanan di bawah ttd */}
                                <View style={styles.bottomContainer}>
                                    {/* Left empty for spacing */}
                                    <View style={styles.ttdContainer}>
                                        <Text style={styles.bottomTextInBottomBox}>Dibuat</Text>
                                        {item.ttd_operator ? (
                                            <Image
                                                source={{ uri: item.ttd_operator }}
                                                style={styles.ttdStyle}
                                            />
                                        ) : null}
                                        <Text style={styles.bottomTextInBottomttdNama}>
                                            {namaOperator}
                                            <Text style={{ color:'rgba(0, 0, 0, 0.5)', fontWeight:'normal' }}> / </Text>
                                            {npkOperator}
                                        </Text>
                                        <Text style={styles.bottomTextInBottomttdTanggal}>
                                            {item.tgl_ttdoperator}
                                        </Text>
                                    </View>

                                    {/* Middle section with text */}
                                    <View style={styles.ttdContainer}>
                                        <Text style={styles.bottomTextInBottomBox}>Diperiksa</Text>
                                        {item.ttd_leader ? (
                                            <Image
                                                source={{ uri: item.ttd_leader }}
                                                style={styles.ttdStyle}
                                            />
                                        ) : (
                                            <Image
                                                source={require('../../image/ttd_kosong.jpg')}
                                                style={styles.ttdStyle}
                                            />
                                        )}
                                        <Text style={styles.bottomTextInBottomttdNama}>
                                            {namaLeader && namaLeader !== "Loading..." ? `${namaLeader}` : "-"}
                                            <Text style={{ color: 'rgba(0, 0, 0, 0.5)', fontWeight: 'normal' }}> / </Text>
                                            {npkLeader && npkLeader !== "Loading..." ? `${npkLeader}` : "-"}
                                        </Text>
                                        <Text style={styles.bottomTextInBottomttdTanggal}>
                                            {item.tgl_ttdleader ? item.tgl_ttdleader : "-"}
                                        </Text>
                                    </View>

                                    {/* Right empty for spacing */}
                                    <View style={styles.ttdContainer}>
                                        <Text style={styles.bottomTextInBottomBox}>Diperiksa</Text>
                                        {item.ttd_kasubsi ? (
                                            <Image
                                                source={{ uri: item.ttd_kasubsi }}
                                                style={styles.ttdStyle}
                                            />
                                        ) : (
                                            <Image
                                                source={require('../../image/ttd_kosong.jpg')}
                                                style={styles.ttdStyle}
                                            />
                                        )}
                                        <Text style={styles.bottomTextInBottomttdNama}>
                                            {namaKasubsi && namaKasubsi !== "Loading..." ? `${namaKasubsi}` : "-"}
                                            <Text style={{ color: 'rgba(0, 0, 0, 0.5)', fontWeight: 'normal' }}> / </Text>
                                            {npkKasubsi && npkKasubsi !== "Loading..." ? `${npkKasubsi}` : "-"}
                                        </Text>
                                        <Text style={styles.bottomTextInBottomttdTanggal}>
                                            {item.tgl_ttdkasubsi ? item.tgl_ttdkasubsi : "-"}
                                        </Text>
                                    </View>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                    {/* Catatan */}
                    {data.map(item => (
                        <React.Fragment key={item.id_checksheettransaction}>
                            <View style={[styles.bottomBoxIsiChecksheetCatatanPlaceholder, { height: item.catatan!= null ? 'auto' : 220, marginBottom:0, transform: [{ translateY: -44 }] }]}>
                                <Text style={styles.topTextInBottomBox}>Catatan</Text>
                                <View style={[styles.cancelContainer, { marginLeft: 20 }]}>
                                    <TextInput
                                        style={styles.cancelTextInput}
                                        placeholder={item.catatan || null}
                                        placeholderTextColor="#000000"
                                        multiline={true}
                                        editable={false}
                                    />
                                </View>
                            </View>
                        </React.Fragment>
                    ))}
                </ScrollView>
            </SafeAreaView>

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
            {/* Drawer Search End  */}
        </DrawerSceneWrapper>
    );
};

export default ChecksheetTungguttd;