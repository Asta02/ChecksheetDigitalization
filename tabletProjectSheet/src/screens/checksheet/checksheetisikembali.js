import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    SafeAreaView,
    TouchableOpacity,
    Image,
    ToastAndroid,
    TextInput,
    BackHandler,
    Platform,
    Dimensions,
    LogBox,
    Keyboard
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler'
import { launchImageLibrary } from 'react-native-image-picker';
import StepIndicator from 'react-native-step-indicator';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerSceneWrapper from '../../components/DrawerSceneWrapper';
import ChecksheetNotifListing from '../../components/NotifChecksheet';
import styles from '../../styles';
import Signature from 'react-native-signature-canvas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash/debounce';

const { width, height } = Dimensions.get("window");
DropDownPicker.setListMode("SCROLLVIEW");
DropDownPicker.setMode("BADGE");


const ChecksheetIsiKembali = ({ navigation, route }) => {
    const { id, status } = route.params;
    const [shiftName, setShiftName] = useState("Loading...");
    const [noWO, setNoWO] = useState("Loading...");
    const [tglCheck, setTglCheck] = useState("Loading...");
    const [tglDelivery, setTglDelivery] = useState("Loading...");
    const [loading, setLoading] = useState(true);
    const [openCatatan, setOpenCatatan] = useState(false);

    //buat effect keyboard
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardOpen(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardOpen(false);
            setOpenCatatan(false);
        });

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const openDrawer = () => {
        navigation.openDrawer();
    };

    //for dropdown battery information

    const [valueBrandBatteryA, setValueBrandBatteryA] = useState(true);
    const [valueNegaraTujuanA, setValueNegaraTujuanA] = useState(true);
    const [valueCustomerA, setValueCustomerA] = useState(true);
    const [itemsBrandBatteryA, setItemsBrandBatteryA] = useState([]);
    useEffect(() => {
        const fetchBrandBattery = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getBrandBattery', {
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
                    label: item.brand_battery,
                    value: item.id.toString(),
                }));

                setItemsBrandBatteryA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchBrandBattery();
    }, []);  // Empty dependency array to run this effect only once
    // const [itemsTypeBatteryA, setItemsTypeBatteryA] = useState([]);
    // useEffect(() => {
    //     const fetchTypeBattery = async () => {
    //         try {
    //             const response = await fetch('http://10.19.101.166:3003/getTypeBattery', {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //             });

    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }

    //             const data = await response.json();

    //             const updatedItems = data.map(item => ({
    //                 label: item.FirstSubstring,
    //                 value: item.FirstSubstring
    //             }));

    //             setItemsTypeBatteryA(updatedItems);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     fetchTypeBattery();
    // }, []);
    const [itemsNegaraTujuanA, setItemsNegaraTujuanA] = useState([]);
    useEffect(() => {
        const fetchNegaraTujuan = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getNegaraTujuan', {
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
                    label: item.negara_tujuan,
                    value: item.id.toString(),
                }));

                setItemsNegaraTujuanA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchNegaraTujuan();
    }, []);
    const [itemsCustomerA, setItemsCustomerA] = useState([]);
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getCustomer', {
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
                    label: item.customer,
                    value: item.id.toString(),
                }));

                setItemsCustomerA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchCustomer();
    }, []);
    const [itemNumber, setItemNumber] = useState("");
    const [typeBattery, setTypeBattery] = useState("");
    const [noDokPCB, setNoDokPCB] = useState("");


    //Packing
    const [jumlahBatteryPaletS, setJumlahBatteryPaletS] = useState("");
    const [jumlahBatteryPaletA, setJumlahBatteryPaletA] = useState("");
    const [kondisiSusunanBattery, setKondisiSusunanBattery] = useState("");
    const [kondisiIkatan, setKondisiIkatan] = useState("");
    const [valueTypePalletS, setValueTypePalletS] = useState('');
    const [itemsTypePalletS, setItemsTypePalletS] = useState([]);
    useEffect(() => {
        const fetchTypePallet = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getTypePallet', {
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
                    label: item.type_pallet,
                    value: item.id.toString(),
                }));

                setItemsTypePalletS(updatedItems);
                setItemsTypePalletA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchTypePallet();
    }, []);
    const [valueTypePalletA, setValueTypePalletA] = useState('');
    const [itemsTypePalletA, setItemsTypePalletA] = useState([]);
    const [tampilanPallet, setTampilanPallet] = useState("");
    const [valueStyrophoreKartonTriplexS, setValueStyrophoreKartonTriplexS] = useState('');
    const [itemsStyrophoreKartonTriplexS, setItemsStyrophoreKartonTriplexS] = useState([]);
    useEffect(() => {
        const fetchStyrophoreKartonTriplex = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getStyrophore', {
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
                    label: item.packing,
                    value: item.id.toString(),
                }));

                setItemsStyrophoreKartonTriplexS(updatedItems);
                setItemsStyrophoreKartonTriplexA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchStyrophoreKartonTriplex();
    }, []);
    const [valueStyrophoreKartonTriplexA, setValueStyrophoreKartonTriplexA] = useState('');
    const [itemsStyrophoreKartonTriplexA, setItemsStyrophoreKartonTriplexA] = useState([]);
    const [inspectionTag, setInspectionTag] = useState("");
    const [shipingMark, setShipingMark] = useState("");
    const [labelProduksi, setLabelProduksi] = useState("");
    const [plastikShrink, setPlastikShrink] = useState("");
    const [kesesuaianTag, setKesesuaianTag] = useState("");


    //Cover
    useEffect(() => {
        const fetchTypeBatteryCover = async () => {
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

                const nonItem = {
                    label: 'non',
                    value: 'non'
                };

                const updatedItems = [
                    ...data.map(item => ({
                        label: item.FirstSubstring,
                        value: item.FirstSubstring,
                    })),
                    nonItem
                ];
                setItemsCoverTypeBatteryA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchTypeBatteryCover();
    }, []);
    const [coverTypeBatteryA, setCoverTypeBatteryA] = useState('');
    const [itemsCoverTypeBatteryA, setItemsCoverTypeBatteryA] = useState([]);
    const [coverTypeBatteryS, setCoverTypeBatteryS] = useState('');
    
    const [tampilanTerminal, setTampilanTerminal] = useState("");
    const [posisiTerminal, setPosisiTerminal] = useState("");
    const [kodeProduksi, setKodeProduksi] = useState("");
    const [tampilanCover, setTampilanCover] = useState("");
    const [kodeFinishing, setKodeFinishing] = useState("");
    const [tampilanVentPlug, setTampilanVentPlug] = useState("");
    const [indicatorElectrolite, setIndicatorElectrolite] = useState("");
    const [valueBrandMarkS, setValueBrandMarkS] = useState('');
    const [itemsBrandMarkS, setItemsBrandMarkS] = useState([]);
    useEffect(() => {
        const fetchBrandMark = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getBrandMark', {
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
                    label: item.brand_mark,
                    value: item.id.toString(),
                }));

                setItemsBrandMarkS(updatedItems);
                setItemsBrandMarkA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchBrandMark();
    }, []);
    const [valueBrandMarkA, setValueBrandMarkA] = useState('');
    const [itemsBrandMarkA, setItemsBrandMarkA] = useState([]);

    const [valueStickerCoverS, setValueStickerCoverS] = useState([]);
    const [itemsStickerCoverS, setItemsStickerCoverS] = useState([]);
    const [valueStickerCoverA, setValueStickerCoverA] = useState([]);
    const [itemsStickerCoverA, setItemsStickerCoverA] = useState([]);


    const [valueWarnaCoverS, setValueWarnaCoverS] = useState('');
    const [itemsWarnaCoverS, setItemsWarnaCoverS] = useState([]);
    useEffect(() => {
        const fetchWarnaCover = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getWarnaCover', {
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
                    label: item.warna_cover,
                    value: item.id.toString(),
                }));

                setItemsWarnaCoverS(updatedItems);
                setItemsWarnaCoverA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchWarnaCover();
    }, []);
    const [valueWarnaCoverA, setValueWarnaCoverA] = useState('');
    const [itemsWarnaCoverA, setItemsWarnaCoverA] = useState([]);

    const [valueTypeVentPlugS, setValueTypeVentPlugS] = useState('');
    const [itemsTypeVentPlugS, setItemsTypeVentPlugS] = useState([]);
    useEffect(() => {
        const fetchTypeVentPlug = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getTypeVentPlug', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                const nonItem = {
                    label: 'non',
                    value: 'non'
                };

                const updatedItems = [
                    ...data.map(item => ({
                        label: item.type_vent_plug,
                        value: item.type_vent_plug,
                    })),
                    nonItem
                ];

                // Set the updated items to the state
                setItemsTypeVentPlugS(updatedItems);
                setItemsTypeVentPlugA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchTypeVentPlug();
    }, []);
    const [valueTypeVentPlugA, setValueTypeVentPlugA] = useState('');
    const [itemsTypeVentPlugA, setItemsTypeVentPlugA] = useState([]);

    const [valueWarnaVentPlugS, setValueWarnaVentPlugS] = useState('');
    const [itemsWarnaVentPlugS, setItemsWarnaVentPlugS] = useState([]);
    useEffect(() => {
        const fetchWarnaVentPlug = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getWarnaVentPlug', {
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
                    label: item.warna_vent_plug,
                    value: item.id.toString(),
                }));

                setItemsWarnaVentPlugS(updatedItems);
                setItemsWarnaVentPlugA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchWarnaVentPlug();
    }, []);
    const [valueWarnaVentPlugA, setValueWarnaVentPlugA] = useState('');
    const [itemsWarnaVentPlugA, setItemsWarnaVentPlugA] = useState([]);

    //Container
    const [valueWarnaContainerS, setValueWarnaContainerS] = useState('');
    const [itemsWarnaContainerS, setItemsWarnaContainerS] = useState([]);
    useEffect(() => {
        const fetchWarnaContainer = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getWarnaContainer', {
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
                    label: item.warna_container,
                    value: item.id.toString(),
                }));

                setItemsWarnaContainerS(updatedItems);
                setItemsWarnaContainerA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchWarnaContainer();
    }, []);
    const [valueWarnaContainerA, setValueWarnaContainerA] = useState('');
    const [itemsWarnaContainerA, setItemsWarnaContainerA] = useState([]);

    const [valueMarkBrandContainerS, setValueMarkBrandContainerS] = useState('');
    const [itemsMarkBrandContainerS, setItemsMarkBrandContainerS] = useState([]);
    useEffect(() => {
        const fetchMarkBrandContainer = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getMarkBrandPrint', {
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
                    label: item.mark_brand_print,
                    value: item.id.toString(),
                }));

                setItemsMarkBrandContainerS(updatedItems);
                setItemsMarkBrandContainerA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchMarkBrandContainer();
    }, []);
    const [valueMarkBrandContainerA, setValueMarkBrandContainerA] = useState('');
    const [itemsMarkBrandContainerA, setItemsMarkBrandContainerA] = useState([]);

    const [valueMarkTypeS, setValueMarkTypeS] = useState('');
    const [itemsMarkTypeS, setItemsMarkTypeS] = useState([]);
    useEffect(() => {
        const fetchMarkTypePrint = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getMarkTypePrint', {
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
                    label: item.mark_type_print,
                    value: item.id.toString(),
                }));

                setItemsMarkTypeS(updatedItems);
                setItemsMarkTypeA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchMarkTypePrint();
    }, []);
    const [valueMarkTypeA, setValueMarkTypeA] = useState('');
    const [itemsMarkTypeA, setItemsMarkTypeA] = useState([]);

    const [valueMarkSpecS, setValueMarkSpecS] = useState('');
    const [openMarkSpecS, setOpenMarkSpecS] = useState(false);
    const [itemsMarkSpecS, setItemsMarkSpecS] = useState([]);
    const [valueMarkSpecA, setValueMarkSpecA] = useState('');
    const [openMarkSpecA, setOpenMarkSpecA] = useState(false);
    const [itemsMarkSpecA, setItemsMarkSpecA] = useState([]);

    const [valueStickerContainerS, setValueStickerContainerS] = useState([]);
    const [itemsStickerContainerS, setItemsStickerContainerS] = useState([]);

    const [valueStickerContainerA, setValueStickerContainerA] = useState([]);
    const [itemsStickerContainerA, setItemsStickerContainerA] = useState([]);


    const [tampilanContainer, setTampilanContainer] = useState('');
    // const [stampS, setStampS] = useState('');
    // const [stampA, setStampA] = useState('');
    const [upperLower, setUpperLower] = useState('');

    //Master Box / K.Box
    const [valueMasterBoxStickerA, setValueMasterBoxStickerA] = useState([]);
    const [itemsMasterBoxStickerA, setItemsMasterBoxStickerA] = useState([]);

    const [valueMasterBoxStickerS, setValueMasterBoxStickerS] = useState([]);
    const [itemsMasterBoxStickerS, setItemsMasterBoxStickerS] = useState([]);

    const [valueMasterBoxMarkBrandA, setValueMasterBoxMarkBrandA] = useState('');
    const [itemsMasterBoxMarkBrandA, setItemsMasterBoxMarkBrandA] = useState([]);
    useEffect(() => {
        const fetchMarkBrand = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getMarkBrand', {
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
                    label: item.mark_brand,
                    value: item.id.toString(),
                }));

                setItemsMasterBoxMarkBrandS(updatedItems);
                setItemsMasterBoxMarkBrandA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchMarkBrand();
    }, []);
    const [valueMasterBoxMarkBrandS, setValueMasterBoxMarkBrandS] = useState('');
    const [itemsMasterBoxMarkBrandS, setItemsMasterBoxMarkBrandS] = useState([]);

    const [valueMasterBoxMarkTypeS, setValueMasterBoxMarkTypeS] = useState('');
    const [itemsMasterBoxMarkTypeS, setItemsMasterBoxMarkTypeS] = useState([]);
    useEffect(() => {
        const fetchMarkType = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getMarkType', {
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
                    label: item.mark_type,
                    value: item.id.toString(),
                }));

                setItemsMasterBoxMarkTypeS(updatedItems);
                setItemsMasterBoxMarkTypeA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchMarkType();
    }, []);
    const [valueMasterBoxMarkTypeA, setValueMasterBoxMarkTypeA] = useState('');
    const [itemsMasterBoxMarkTypeA, setItemsMasterBoxMarkTypeA] = useState([]);

    const [valueMasterBoxMarkSpecS, setValueMasterBoxMarkSpecS] = useState('');
    const [itemsMasterBoxMarkSpecS, setItemsMasterBoxMarkSpecS] = useState([]);
    useEffect(() => {
        const fetchMarkSpec = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getMarkSpec', {
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
                    label: item.mark_spec,
                    value: item.id.toString(),
                }));

                setItemsMasterBoxMarkSpecS(updatedItems);
                setItemsMasterBoxMarkSpecA(updatedItems);
                // setItemsMarkSpecS(updatedItems);
                // setItemsMarkSpecA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchMarkSpec();
    }, []);
    const [valueMasterBoxMarkSpecA, setValueMasterBoxMarkSpecA] = useState('');
    const [itemsMasterBoxMarkSpecA, setItemsMasterBoxMarkSpecA] = useState([]);

    const [masterBoxStamp, setMasterBoxStamp] = useState([]);
    const [itemsMasterBoxStamp, setItemsMasterBoxStamp] = useState([]);
    useEffect(() => {
        const fetchStamp = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getStamp', {
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
                    label: item.stamp,
                    value: item.id.toString(),
                }));

                setItemsMasterBoxStamp(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchStamp();
    }, []);

    const [tampilanKabo, setTampilanKabo] = useState("");
    const [isolasi, setIsolasi] = useState("");
    const [instructionManualSisiPendek, setInstructionManualSisiPendek] = useState("");

    //Accessories
    const [valueWarrantyCardS, setValueWarrantyCardS] = useState('');
    const [itemsWarrantyCardS, setItemsWarrantyCardS] = useState([]);
    useEffect(() => {
        const fetchWarrantyCard = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getWarrantyCard', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                const nonItem = {
                    label: 'non',
                    value: 'non'
                };

                const updatedItems = [
                    ...data.map(item => ({
                        label: item.warranty_card,
                        value: item.warranty_card,
                    })),
                    nonItem
                ];

                setItemsWarrantyCardS(updatedItems);
                setItemsWarrantyCardA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchWarrantyCard();
    }, []);
    const [valueWarrantyCardA, setValueWarrantyCardA] = useState('');
    const [itemsWarrantyCardA, setItemsWarrantyCardA] = useState([]);

    
    const [valueInstructionManualLabelS, setValueInstructionManualLabelS] = useState('');
    const [itemsInstructionManualLabelS, setItemsInstructionManualLabelS] = useState([]);
    useEffect(() => {
        const fetchInstructionManualLabel = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getInstructionManualLabel', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                const nonItem = {
                    label: 'non',
                    value: 'non'
                };

                const updatedItems = [
                    ...data.map(item => ({
                        label: item.instruction_manual,
                        value: item.instruction_manual,
                    })),
                    nonItem
                ];

                setItemsInstructionManualLabelS(updatedItems);
                setItemsInstructionManualLabelA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchInstructionManualLabel();
    }, []);
    const [valueInstructionManualLabelA, setValueInstructionManualLabelA] = useState('');
    const [itemsInstructionManualLabelA, setItemsInstructionManualLabelA] = useState([]);

    const [valueElbowS, setValueElbowS] = useState('');
    const [itemsElbowS, setItemsElbowS] = useState([]);
    useEffect(() => {
        const fetchInstructionManualLabel = async () => {
            try {
                const response = await fetch('http://10.19.101.166:3003/getElbow', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                const nonItem = {
                    label: 'non',
                    value: 'non'
                };

                const updatedItems = [
                    ...data.map(item => ({
                        label: item.elbow,
                        value: item.elbow,
                    })),
                    nonItem
                ];

                setItemsElbowS(updatedItems);
                setItemsElbowA(updatedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchInstructionManualLabel();
    }, []);
    const [valueElbowA, setValueElbowA] = useState('');
    const [itemsElbowA, setItemsElbowA] = useState([]);


    //handle open dropdown
    const [dropdowns, setDropdowns] = useState({
        brandBatteryA: false,
        typeBatteryA: false,
        negaraTujuanA: false,
        customerA: false,
        typePalletS: false,
        typePalletA: false,
        styrophoreKartonTriplexS: false,
        styrophoreKartonTriplexA: false,
        brandMarkS: false,
        brandMarkA: false,
        stickerCoverS: false,
        stickerCoverA: false,
        warnaCoverS: false,
        warnaCoverA: false,
        typeVentPlugS: false,
        typeVentPlugA: false,
        warnaVentPlugS: false,
        warnaVentPlugA: false,
        warnaContainerS: false,
        warnaContainerA: false,
        markBrandContainerS: false,
        markBrandContainerA: false,
        markTypeS: false,
        markTypeA: false,
        stickerContainerS: false,
        stickerContainerA: false,
        masterBoxStickerA: false,
        masterBoxStickerS: false,
        masterBoxMarkBrandA: false,
        masterBoxMarkBrandS: false,
        masterBoxMarkTypeS: false,
        masterBoxMarkTypeA: false,
        masterBoxMarkSpecS: false,
        masterBoxMarkSpecA: false,
        masterBoxStamp: false,
        warrantyCardS: false,
        warrantyCardA: false,
        instructionManualLabelS: false,
        instructionManualLabelA: false,
        elbowS: false,
        elbowA: false,
        coverTypeBatteryA: false,
    });

    const setOpen = (dropdownName) => {
        // Toggle the dropdown
        setDropdowns(prevState => ({
            ...Object.fromEntries(
                Object.keys(prevState).map(key => [key, key === dropdownName ? !prevState[key] : false])
            )
        }));
    };


    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                const loadResponse = await fetch(`http://10.19.101.166:3003/getChecksheetDetailDraft/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if (!loadResponse.ok) {
                    throw new Error('Failed to load data');
                }

                const fetchedDataAll = await loadResponse.json();
                const fetchedData = fetchedDataAll[0];
                const formatDate = (dateString) => {
                    return new Date(dateString).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    });
                };
                const formattedData = fetchedDataAll.map(item => ({
                    ...item,
                    tgl_check: formatDate(item.tgl_check),
                    tgl_delivery: formatDate(item.tgl_delivery),
                }));
                setTglCheck(formattedData[0].tgl_check);
                setTglDelivery(formattedData[0].tgl_delivery);

                if (fetchedData.no_wo !== null) {
                    setNoWO(fetchedData.no_wo);
                }

                const shiftid = fetchedData.shift;
                try {
                    const loadResponse = await fetch(`http://10.19.101.166:3003/getShiftByChecksheet/${shiftid}`, {
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

                //Battery information
                if (fetchedData.brand_battery !== null) {
                    setValueBrandBatteryA(fetchedData.brand_battery.toString());
                }
                if (fetchedData.type_battery !== null) {
                    setTypeBattery(fetchedData.type_battery);
                }
                if (fetchedData.batteryNegaraTujuan !== null) {
                    setValueNegaraTujuanA(fetchedData.batteryNegaraTujuan.toString());
                }
                if (fetchedData.customer !== null) {
                    setValueCustomerA(fetchedData.customer.toString());
                }
                if (fetchedData.no_dok_pcb !== null) {
                    setNoDokPCB(fetchedData.no_dok_pcb);
                }
                if (fetchedData.item_number !== null) {
                    setItemNumber(fetchedData.item_number);
                }

                // Packing - Standard
                if (fetchedData.jumlah_batterypalet_standard !== null) {
                    setJumlahBatteryPaletS(fetchedData.jumlah_batterypalet_standard.toString());
                }
                if (fetchedData.type_palletno_standard !== null) {
                    setValueTypePalletS(fetchedData.type_palletno_standard.toString());
                }
                if (fetchedData.styrophore_karton_triplex_standard !== null) {
                    setValueStyrophoreKartonTriplexS(fetchedData.styrophore_karton_triplex_standard.toString());
                }
                if (fetchedData.kondisi_susunanbattery !== null) {
                    setKondisiSusunanBattery(fetchedData.kondisi_susunanbattery);
                }
                if (fetchedData.kondisi_ikatan !== null) {
                    setKondisiIkatan(fetchedData.kondisi_ikatan);
                }
                if (fetchedData.tampilan_palet !== null) {
                    setTampilanPallet(fetchedData.tampilan_palet);
                }
                if (fetchedData.inspection_tag !== null) {
                    setInspectionTag(fetchedData.inspection_tag);
                }
                if (fetchedData.shiping_mark !== null) {
                    setShipingMark(fetchedData.shiping_mark);
                }
                if (fetchedData.label_produksi !== null) {
                    setLabelProduksi(fetchedData.label_produksi);
                }
                if (fetchedData.plastik_shrink !== null) {
                    setPlastikShrink(fetchedData.plastik_shrink);
                }

                // Packing - Actual
                if (fetchedData.jumlah_batterypalet_actual !== null) {
                    setJumlahBatteryPaletA(fetchedData.jumlah_batterypalet_actual.toString());
                }
                if (fetchedData.type_palletno_actual !== null) {
                    setValueTypePalletA(fetchedData.type_palletno_actual.toString());
                }
                if (fetchedData.styrophore_karton_triplex_actual !== null) {
                    setValueStyrophoreKartonTriplexA(fetchedData.styrophore_karton_triplex_actual.toString());
                }
                if (fetchedData.kesesuaian_tag !== null) {
                    setKesesuaianTag(fetchedData.kesesuaian_tag);
                }

                // Cover - Standard
                if (fetchedData.coverWarnaStandard !== null) {
                    setValueWarnaCoverS(fetchedData.coverWarnaStandard.toString());
                }
                if (fetchedData.coverBrandMarkStandard !== null) {
                    setValueBrandMarkS(fetchedData.coverBrandMarkStandard.toString());
                }
                if (fetchedData.coverTypeVentPlugStandard !== null) {
                    setValueTypeVentPlugS(fetchedData.coverTypeVentPlugStandard);
                }
                if (fetchedData.coverWarnaVentPlugStandard !== null) {
                    setValueWarnaVentPlugS(fetchedData.coverWarnaVentPlugStandard.toString());
                }
                if (fetchedData.coverPosisiTerminalStandard !== null) {
                    setPosisiTerminal(fetchedData.coverPosisiTerminalStandard);
                }
                if (fetchedData.coverTypeBatteryStandard !== null) {
                    setCoverTypeBatteryS(fetchedData.coverTypeBatteryStandard);
                }

                // Cover - Actual
                if (fetchedData.coverWarnaActual !== null) {
                    setValueWarnaCoverA(fetchedData.coverWarnaActual.toString());
                }
                if (fetchedData.coverBrandMarkActual !== null) {
                    setValueBrandMarkA(fetchedData.coverBrandMarkActual.toString());
                }
                if (fetchedData.coverTypeVentPlugActual !== null) {
                    setValueTypeVentPlugA(fetchedData.coverTypeVentPlugActual);
                }
                if (fetchedData.coverWarnaVentPlugActual !== null) {
                    setValueWarnaVentPlugA(fetchedData.coverWarnaVentPlugActual.toString());
                }
                if (fetchedData.coverIndicatorElectrolite !== null) {
                    setIndicatorElectrolite(fetchedData.coverIndicatorElectrolite);
                }
                if (fetchedData.coverTampilanTerminal !== null) {
                    setTampilanTerminal(fetchedData.coverTampilanTerminal);
                }
                if (fetchedData.coverPosisiTerminal !== null) {
                    setPosisiTerminal(fetchedData.coverPosisiTerminal);
                }
                if (fetchedData.tampilan_cover !== null) {
                    setTampilanCover(fetchedData.tampilan_cover);
                }
                if (fetchedData.coverKodeFinishingActual !== null) {
                    setKodeFinishing(fetchedData.coverKodeFinishingActual);
                }
                if (fetchedData.coverTampilanVentPlug !== null) {
                    setTampilanVentPlug(fetchedData.coverTampilanVentPlug);
                }
                if (fetchedData.coverTypeBatteryActual !== null) {
                    setCoverTypeBatteryA(fetchedData.coverTypeBatteryActual);
                }
                if (fetchedData.coverKodeProduksi !== null) {
                    setKodeProduksi(fetchedData.coverKodeProduksi);
                }
                
                // Container - Standard
                if (fetchedData.containerWarnaStandard !== null) {
                    setValueWarnaContainerS(fetchedData.containerWarnaStandard.toString());
                }
                if (fetchedData.containerMarkBrandStandard !== null) {
                    setValueMarkBrandContainerS(fetchedData.containerMarkBrandStandard.toString());
                }
                if (fetchedData.containerMarkTypeStandard !== null) {
                    setValueMarkTypeS(fetchedData.containerMarkTypeStandard.toString());
                }
                if (fetchedData.containerMarkSpecStandard !== null) {
                    setValueMarkSpecS(fetchedData.containerMarkSpecStandard);
                }

                // Container - Actual
                if (fetchedData.containerWarnaActual !== null) {
                    setValueWarnaContainerA(fetchedData.containerWarnaActual.toString());
                }
                if (fetchedData.containerMarkBrandActual !== null) {
                    setValueMarkBrandContainerA(fetchedData.containerMarkBrandActual.toString());
                }
                if (fetchedData.containerMarkTypeActual !== null) {
                    setValueMarkTypeA(fetchedData.containerMarkTypeActual.toString());
                }
                if (fetchedData.containerMarkSpecActual !== null) {
                    setValueMarkSpecA(fetchedData.containerMarkSpecActual);
                }
                // if (fetchedData.containerStampActual !== null) {
                //     setStampA(fetchedData.containerStampActual);
                // }
                if (fetchedData.containerUpperLowerLevel !== null) {
                    setUpperLower(fetchedData.containerUpperLowerLevel);
                }
                if (fetchedData.containerTampilan !== null) {
                    setTampilanContainer(fetchedData.containerTampilan);
                }

                // Master Box / K.Box - Standard
                if (fetchedData.kBoxMarkTypeStandard !== null) {
                    setValueMasterBoxMarkTypeS(fetchedData.kBoxMarkTypeStandard.toString());
                }
                if (fetchedData.kBoxMarkSpecStandard !== null) {
                    setValueMasterBoxMarkSpecS(fetchedData.kBoxMarkSpecStandard.toString());
                }
                if (fetchedData.kBoxMarkBrandStandard !== null) {
                    setValueMasterBoxMarkBrandS(fetchedData.kBoxMarkBrandStandard.toString());
                }

                // Master Box / K.Box - Actual
                if (fetchedData.kBoxMarkTypeActual !== null) {
                    setValueMasterBoxMarkTypeA(fetchedData.kBoxMarkTypeActual.toString());
                }
                if (fetchedData.kBoxMarkSpecActual !== null) {
                    setValueMasterBoxMarkSpecA(fetchedData.kBoxMarkSpecActual.toString());
                }
                if (fetchedData.kBoxMarkBrandActual !== null) {
                    setValueMasterBoxMarkBrandA(fetchedData.kBoxMarkBrandActual.toString());
                }
                if (fetchedData.kBoxTampilan !== null) {
                    setTampilanKabo(fetchedData.kBoxTampilan);
                }
                if (fetchedData.kBoxInstructionManual !== null) {
                    setInstructionManualSisiPendek(fetchedData.kBoxInstructionManual);
                }
                if (fetchedData.kBoxIsolasi !== null) {
                    setIsolasi(fetchedData.kBoxIsolasi);
                }
                if (fetchedData.kBoxStamp !== null && fetchedData.kBoxStamp !== undefined) {
                    const boxStampArray = fetchedData.kBoxStamp.toString().split(",");
                    setMasterBoxStamp(boxStampArray);
                }

                // Accessories - Standard
                if (fetchedData.warranty_card_standard !== null) {
                    setValueWarrantyCardS(fetchedData.warranty_card_standard);
                }
                if (fetchedData.instuction_manual_standard !== null) {
                    setValueInstructionManualLabelS(fetchedData.instuction_manual_standard);
                }
                if (fetchedData.elbow_standard !== null) {
                    setValueElbowS(fetchedData.elbow_standard);
                }

                // Accessories - Actual
                if (fetchedData.warranty_card_actual !== null) {
                    setValueWarrantyCardA(fetchedData.warranty_card_actual);
                }
                if (fetchedData.instuction_manual_actual !== null) {
                    setValueInstructionManualLabelA(fetchedData.instuction_manual_actual);
                }
                if (fetchedData.elbow_actual !== null) {
                    setValueElbowA(fetchedData.elbow_actual);
                }
                if (fetchedData.catatan !== null) {
                    setCatatan(fetchedData.catatan);
                }
                

                // Multiple Values
                // Fetch sticker data
                const stickerResponse = await fetch('http://10.19.101.166:3003/getSticker', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!stickerResponse.ok) {
                    throw new Error('Failed to load sticker data');
                }

                const stickerData = await stickerResponse.json();

                const nonItem = {
                    label: 'non',
                    value: 'non'
                };

                const updatedItems = [
                    ...stickerData.map(item => ({
                    label: item.sticker,
                    value: item.sticker
                    })),
                    nonItem
                ];

                setItemsStickerCoverS(updatedItems);
                setItemsStickerCoverA(updatedItems);
                setItemsStickerContainerS(updatedItems);
                setItemsStickerContainerA(updatedItems);
                setItemsMasterBoxStickerS(updatedItems);
                setItemsMasterBoxStickerA(updatedItems);

                // Update sticker values based on fetched data
                const updateStickerValues = (key, stateSetter) => {
                    const value = fetchedData[key];
                    if (value !== null && value !== undefined) {
                        stateSetter(value.toString().split(","));
                    }
                };

                updateStickerValues('coverStickerStandard', setValueStickerCoverS);
                updateStickerValues('coverStickerActual', setValueStickerCoverA);
                updateStickerValues('containerStickerStandard', setValueStickerContainerS);
                updateStickerValues('containerStickerActual', setValueStickerContainerA);
                updateStickerValues('kBoxStickerStandard', setValueMasterBoxStickerS);
                updateStickerValues('kBoxStickerActual', setValueMasterBoxStickerA);


            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);
    const changeModifDate = async () => {
        try {
            const updateResponse = await fetch(`http://10.19.101.166:3003/changeModifiedDate/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update modified date');
            }
        } catch (error) {
            console.error('Error to update modified date:', error);
        }
    };

    const [selectedItem, setSelectedItem] = useState('Battery Information');
    const [showDrawer, setShowDrawer] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalSubmitVisible, setIsModalSubmitVisible] = useState(false);
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
    const [startIndex, setStartIndex] = useState(0);
    const [stepSA, setStepSA] = useState(0);
    const [selectedFileName, setSelectedFileName] = useState(null);
    const [selectedPhotos, setSelectedPhotos] = useState(null);
    const [inputCancel, setInputCancel] = useState('');
    const [batteryInformationPosition, setBatteryInformationPosition] = useState(0);
    const [packingPosition, setPackingPosition] = useState(0);
    const [coverPosition, setCoverPosition] = useState(0);
    const [containerPosition, setContainerPosition] = useState(0);
    const [masterBoxPosition, setMasterBoxPosition] = useState(0);
    const [accessoriesPosition, setAcessoriesPosition] = useState(0);

    const [textFooterTengah, setTextFooterTengah] = useState('');
    const stepLabelsMap = {
        'Battery Information': ["Brand Battery *", "Item Number *", "Type Battery *", "No Dok PCB *", "Negara Tujuan (Khusus Export) *", "Customer *"],
        'Packing': ["Jumlah Battery/Pallet *", "Kondisi Susunan battery", "Kondisi Ikatan", "Type Pallet / No *", "Tampilan pallet", "Styrophore/Karton/Triplex *", "Inspection Tag", "Shiping Mark", "Label Produksi", "Plastik shrink", "Kesesuaian tag, label dan item number"],
        'Cover': ["Type Battery *", "Warna Cover *", "Tampilan Terminal", "Brand Mark *", "Tampilan Cover", "Kode Finishing *", "Kode Produksi *", "Sticker *", "Type vent plug *", "Warna Vent Plug *", "Tampilan Vent Plug", "Indicator Electrolite"],
        'Container': ["Warna Container *", "Mark Brand ( Print ) *", "Mark Type ( Print ) *", "Upper / Lower Level ( Print )", "Tampilan Container", "Sticker *"],
        'Master Box / K.Box': ["Tampilan kabo", "Sticker *", "Mark Brand *", "Mark Type *", "Mark Spec *", "Instruction Manual           (sisi pendek)", "Stamp *", "Isolasi"],
        'Accessories': ["Warranty Card *", "Instruction Manual (label) *", "Elbow"]
    };
    const placeHolderMap = {
        'Battery Information': ["-", "-", "-", "-", "-", "-"],
        'Packing': ["-", "Sesuai standar packing, tidak keluar dari pallet / Over hanging", "Rapi / tidak miring", "-", "Bersih, tidak berjamur, Patah/Retak", "-", "Tersedia", "Tersedia", "Tersedia", "Tidak basah", "Sesuai"],
        'Cover': ["-", "-", "Tidak Cacat, tidak bengkok, tidak menghitam", "-", "Bersih, tidak cacat", "Tersedia", "Tersedia", "-", "-", "-", "TIDAK CACAT", "ADA  /  TIDAK ADA"],
        'Container': ["-", "-", "-", "Tersedia", "BERSIH, tidak cacat", "-"],
        'Master Box / K.Box': ["Tidak kembung/ penyok/ sobek", "-", "-", "-", "-", "ADA  /  TIDAK ADA", "ADA  /  TIDAK ADA", "Terpasang rapi"],
        'Accessories': ["-","-","-"]
    };
    const getPlaceHolderArray = (selectedItem) => {
        if (selectedItem === 'Battery Information') return placeHolderMap['Battery Information'];
        if (selectedItem === 'Packing') return placeHolderMap['Packing'];
        if (selectedItem === 'Cover') return placeHolderMap['Cover'];
        if (selectedItem === 'Container') return placeHolderMap['Container'];
        if (selectedItem === 'Master Box / K.Box') return placeHolderMap['Master Box / K.Box'];
        if (selectedItem === 'Accessories') return placeHolderMap['Accessories'];
        return [];
    };
    const truncateText = (text, maxLength) => {
        if (text === undefined) {
            text = '';
        }
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };
    const placeHolderArray = getPlaceHolderArray(selectedItem);
    const truncatedText = truncateText(placeHolderArray[startIndex], 25);

    const handleLabelClick = (position) => {
        setStartIndex(position);
    };

    const SelectableItem = ({ label, onPress, isSelected, backgroundColor, position }) => {
        let stepsLength = 0;
        if (stepLabelsMap[label]) {
            stepsLength = stepLabelsMap[label].length;
        }

        const handlePress = () => {
            // Call setStartIndex(0) when onPress event occurs
            setStartIndex(0);
            setStepSA(0);
            setTextFooterTengah("");
            onPress();
        };

        const progressContainerStyle = position >= stepsLength ? styles.progressContainer : styles.progressContainerEmpty;
        const progressTextStyle = position >= stepsLength ? styles.progressText : styles.progressTextEmpty;

        return (
            <TouchableOpacity onPress={handlePress}>
                <View style={[styles.inputContainerBuatChecksheet, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isSelected ? backgroundColor : '#F4F4F4', paddingVertical: isKeyboardOpen ? 8 : 15, marginVertical: isKeyboardOpen ? 3 : 8 }]}>
                    <Text style={[styles.listTitle, { fontWeight: 'bold', paddingTop: 0, paddingLeft: 0, marginHorizontal: 4, color: isSelected ? '#ffffff' : '#000' }]}>
                        {label === 'Master Box / K.Box' ? 'Karton Box' : label}
                    </Text>
                    <View style={progressContainerStyle}>
                        <Text style={progressTextStyle}>
                            {position} / {stepsLength}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const customStyles = {
        stepIndicatorSize: 25,
        currentStepIndicatorSize: 30,
        separatorStrokeWidth: 2,
        currentStepStrokeWidth: 3,
        stepStrokeCurrentColor: 'rgb(27, 88, 176)',
        stepStrokeWidth: 3,
        stepStrokeFinishedColor: 'rgb(27, 88, 176)',
        stepStrokeUnFinishedColor: '#aaaaaa',
        separatorFinishedColor: 'rgb(27, 88, 176)',
        separatorUnFinishedColor: '#aaaaaa',
        stepIndicatorFinishedColor: 'rgb(27, 88, 176)',
        stepIndicatorUnFinishedColor: '#ffffff',
        stepIndicatorCurrentColor: '#ffffff',
        stepIndicatorLabelFontSize: 12,
        currentStepIndicatorLabelFontSize: 12,
        stepIndicatorLabelCurrentColor: 'rgb(27, 88, 176)',
        stepIndicatorLabelFinishedColor: '#ffffff',
        stepIndicatorLabelUnFinishedColor: '#aaaaaa',
        labelColor: '#999999',
        labelSize: 12,
        currentStepLabelColor: 'rgb(27, 88, 176)',
        labelAlign: 'flex-start'
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };
    const closeSubmitModal = () => {
        setIsModalSubmitVisible(false);
    };
    LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
    LogBox.ignoreAllLogs();//Ignore all log notifications

    const handleUploadPress = () => {
        if (Platform.OS === 'android') {
            launchAndroidGallery();
        } else {
            console.log('Sorry, gallery selection is not supported on iOS.');
        }
    };

    const handleInputCancel = (text) => {
        setInputCancel(text);
    };

    const convertToBase64 = async (uri) => {
        return new Promise((resolve, reject) => {
            fetch(uri)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64data = reader.result;
                        resolve(base64data);
                    };
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(blob);
                })
                .catch(error => reject(error));
        });
    };

    const launchAndroidGallery = () => {
        launchImageLibrary({}, async (response) => {
            if (response.error) {
                Alert.alert('Error', 'Failed to open gallery');
            } else if (response.didCancel) {
                console.log('User cancelled image picker');
            } else {
                try {
                    const base64Image = await convertToBase64(response.assets[0].uri);
                    setSelectedPhotos(base64Image);
                    setSelectedFileName(response.assets[0].fileName || response.assets[0].uri.split('/').pop());
                } catch (error) {
                    console.error('Error converting image to base64:', error);
                }
            }
        });
    };

    const submitCancel = async () => {
        if (selectedFileName == null && (inputCancel == null || inputCancel == '' )){
            ToastAndroid.showWithGravity(
                'Harap isi alasan cancel dan unggah lampiran terlebih dahulu',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
        }
        else if (inputCancel == null || inputCancel == '') {
            ToastAndroid.showWithGravity(
                'Harap isi alasan cancel terlebih dahulu',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
        }
        else if (selectedFileName == null) {
            ToastAndroid.showWithGravity(
                'Harap unggah lampiran terlebih dahulu',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
        }
        else{
              try {
                  const updateResponse = await fetch(`http://10.19.101.166:3003/cancelChecksheet/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        canceled_message: inputCancel,
                        canceled_photo: selectedPhotos
                    })
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update information');
                }else{
                    closeModal();
                    ToastAndroid.showWithGravity(
                        'Checksheet berhasil di cancel',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                    navigation.replace('dashboard');
                }
            } catch (error) {
                console.error('Error updating information:', error);
            }
        }
    };

    const cancelClick = () => {
        setIsModalVisible(true);
    };

    const submitClick = () => {
        setIsModalSubmitVisible(true);
    };

    const stripClick = () => {
        if (selectedItem === 'Battery Information') {
            const indices = [3];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("-");
            }
        }
        else if (selectedItem === 'Packing') {
            const indices = [1, 2, 4, 6, 7, 8, 9, 10];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("-");
            }
        } 
        else if (selectedItem === 'Cover') {
            const indices = [0, 2, 4, 5, 6, 10, 11];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("-");
            }
        }
        else if (selectedItem === 'Container') {
            const indices = [3, 4];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("-");
            }
        }
        else if (selectedItem === 'Master Box / K.Box') {
            const indices = [0, 5, 7];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("-");
            }
        }
    };

    const checkClick = () => {
        if (selectedItem === 'Battery Information') {
            const indices = [3];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("ok");
            }
        }
        else if (selectedItem === 'Packing') {
            const indices = [1, 2, 4, 6, 7, 8, 9, 10];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("ok");
            }
        } 
        else if (selectedItem === 'Cover') {
            const indices = [0, 2, 4, 5, 6, 10, 11];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("ok");
            }
        }
        else if (selectedItem === 'Container') {
            const indices = [3, 4];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("ok");
            }
        } 
        else if (selectedItem === 'Master Box / K.Box') {
            const indices = [0, 5, 7];
            if (indices.includes(startIndex)) {
                setTextFooterTengah("ok");
            }
        }
    };

    const handleNotificationClick = () => {
        setShowDrawer(true);
    };

    const closeDrawer = () => {
        setShowDrawer(false);
    };

    const handlePrevious = () => {
        setTextFooterTengah("");
        const textInput = textInputRef.current;

        if (startIndex > 0) {
            setStartIndex(startIndex - 1);
        }
        else if (selectedItem === 'Packing' && (startIndex === 0 && stepSA === 1)) {
            setStepSA(0);
        }
        else if (selectedItem === 'Accessories' && startIndex == 0) {
            setSelectedItem('Master Box / K.Box');
            setStartIndex(stepLabelsMap['Master Box / K.Box'].length - 1);
            setTextFooterTengah(isolasi);
            textInput.focus();
        }
        else if (selectedItem === 'Master Box / K.Box' && startIndex == 0) {
            setSelectedItem('Container');
            setStartIndex(stepLabelsMap['Container'].length - 1);
        }
        else if (selectedItem === 'Container' && startIndex == 0) {
            setSelectedItem('Cover');
            setStepSA(1);
            setStartIndex(stepLabelsMap['Cover'].length - 1);
        }
        else if (selectedItem === 'Cover' && startIndex == 0) {
            setSelectedItem('Packing');
            setStartIndex(stepLabelsMap['Packing'].length - 1);
        }
        else if (selectedItem === 'Packing' && startIndex == 0) {
            setSelectedItem('Battery Information');
            setStepSA(0);
            setStartIndex(stepLabelsMap['Battery Information'].length - 1);
        }
        else {
            setStartIndex(startIndex);
        }


        if (selectedItem === 'Battery Information') {
            const actions = {
                4: noDokPCB
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
        else if (selectedItem === 'Packing') {
            const actions = {
                0: null,
                1: jumlahBatteryPaletS,
                2: kondisiSusunanBattery,
                3: kondisiIkatan,
                5: tampilanPallet,
                7: inspectionTag,
                8: shipingMark,
                9: labelProduksi,
                10: plastikShrink,
                11: kesesuaianTag
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
        else if (selectedItem === 'Cover') {
            const actions = {
                0: kesesuaianTag,
                3: tampilanTerminal,
                5: tampilanCover,
                6: kodeFinishing,
                7: kodeProduksi,
                11: tampilanVentPlug
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
        else if (selectedItem === 'Container') {
            const actions = {
                0: indicatorElectrolite,
                4: upperLower,
                5: tampilanContainer
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
        else if (selectedItem === 'Master Box / K.Box') {
            const actions = {
                0: null,
                1: tampilanKabo,
                6: instructionManualSisiPendek
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
    };

    const handleNext = () => {
        const textInput = textInputRef.current;
        setTextFooterTengah("");

        if (selectedItem === 'Packing' && (startIndex === 0 && stepSA === 0)) {
            setStepSA(1);
        }
        else if (startIndex + 1 < stepLabelsMap[selectedItem].length) {
            setStepSA(0);
            setStartIndex(startIndex + 1);
        } 
        else if (selectedItem === 'Battery Information' && startIndex + 1 >= stepLabelsMap[selectedItem].length) {
            setStartIndex(0);
            setSelectedItem('Packing');
        } 
        else if (selectedItem === 'Packing' && startIndex + 1 >= stepLabelsMap[selectedItem].length) {
            setStartIndex(0);
            setSelectedItem('Cover');
            setStepSA(1);
        } 
        else if (selectedItem === 'Cover' && startIndex + 1 >= stepLabelsMap[selectedItem].length) {
            setStartIndex(0);
            setSelectedItem('Container');
        } 
        else if (selectedItem === 'Container' && startIndex + 1 >= stepLabelsMap[selectedItem].length) {
            setStartIndex(0);
            setSelectedItem('Master Box / K.Box');
        } 
        else if (selectedItem === 'Master Box / K.Box' && startIndex + 1 >= stepLabelsMap[selectedItem].length) {
            setStartIndex(0);
            setSelectedItem('Accessories');
        } 
        else {
            setStartIndex(startIndex);
        }

        if (selectedItem === 'Battery Information') {
            const actions = {
                2: noDokPCB,
                5: jumlahBatteryPaletS
            };
            
            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
        else if (selectedItem === 'Packing') {
            const actions = {
                0: () => {
                    if (stepSA === 0) {
                        setTextFooterTengah(jumlahBatteryPaletA);
                    } else {
                        setTextFooterTengah(kondisiSusunanBattery)
                    }
                },
                1: kondisiIkatan,
                3: tampilanPallet,
                5: inspectionTag,
                6: shipingMark,
                7: labelProduksi,
                8: plastikShrink,
                9: kesesuaianTag
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
        else if (selectedItem === 'Cover') {
            const actions = {
                1: tampilanTerminal,
                3: tampilanCover,
                4: kodeFinishing,
                5: kodeProduksi,
                9: tampilanVentPlug,
                10: indicatorElectrolite
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
        else if (selectedItem === 'Container') {
            const actions = {
                2: upperLower,
                3: tampilanContainer,
                5: tampilanKabo
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
        else if (selectedItem === 'Master Box / K.Box') {
            const actions = {
                4: instructionManualSisiPendek,
                6: isolasi
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                if (action !== null) {
                    setTextFooterTengah(action);
                }
                if (textInput && !isKeyboardOpen) {
                    setTimeout(() => {
                        textInput.focus();
                    }, 100);
                }
            }
            else if (textInput) {
                textInput.blur();
            }
        }
    };

    

    // tulisan footer di tengah
    const textInputRef = useRef(null);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const handleTextFooter = async () => {
        if (selectedItem === 'Battery Information') {
            const actions = {
                3: setNoDokPCB
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                action(textFooterTengah);
            }
        }
        else if (selectedItem === 'Packing') {
            const actions = {
                0: () => {
                    const numericValue = parseFloat(textFooterTengah);
                    if (!isNaN(numericValue)) { // Check if it's a valid number
                        if (stepSA === 0) {
                            setJumlahBatteryPaletS(textFooterTengah);
                        } else {
                            setJumlahBatteryPaletA(textFooterTengah);
                        }
                    }
                },
                1: setKondisiSusunanBattery,
                2: setKondisiIkatan,
                4: setTampilanPallet,
                6: setInspectionTag,
                7: setShipingMark,
                8: setLabelProduksi,
                9: setPlastikShrink,
                10: setKesesuaianTag
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                action(textFooterTengah);
            }
        }
        else if (selectedItem === 'Cover') {
            const actions = {
                2: setTampilanTerminal,
                4: setTampilanCover,
                5: setKodeFinishing,
                6: setKodeProduksi,
                10: setTampilanVentPlug,
                11: setIndicatorElectrolite
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                action(textFooterTengah);
            }
        }
        else if (selectedItem === 'Container') {
            const actions = {
                3: setUpperLower,
                4: setTampilanContainer
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                action(textFooterTengah);
            }
        }
        else if (selectedItem === 'Master Box / K.Box') {
            const actions = {
                0: setTampilanKabo,
                5: setInstructionManualSisiPendek,
                7: setIsolasi
            };

            if (startIndex in actions) {
                const action = actions[startIndex];
                action(textFooterTengah);
            }
        }
    }
    useEffect(() => {
        handleTextFooter();
    }, [textFooterTengah]);

    //Set the startIndex based on the state of the dropdowns atau teks
    useEffect(() => {
        if (dropdowns.brandBatteryA) {
            setStartIndex(0);
        } else if (dropdowns.negaraTujuanA) {
            setStartIndex(4);
        } else if (dropdowns.customerA) {
            setStartIndex(5);
        }
    }, [dropdowns]);

    //packing
    useEffect(() => {
        if (dropdowns.styrophoreKartonTriplexS || dropdowns.styrophoreKartonTriplexA) {
            setStartIndex(5);
        } else if (dropdowns.typePalletS || dropdowns.typePalletA) {
            setStartIndex(3);
        }
    }, [dropdowns]);

    //cover
    useEffect(() => {
        if (dropdowns.coverTypeBatteryA) {
            setStartIndex(0);
        }
        else if (dropdowns.warnaCoverS || dropdowns.warnaCoverA) {
            setStartIndex(1);
        } else if (dropdowns.brandMarkS || dropdowns.brandMarkA) {
            setStartIndex(3);
        } else if (dropdowns.stickerCoverS || dropdowns.stickerCoverA) {
            setStartIndex(7);
        } else if (dropdowns.typeVentPlugS || dropdowns.typeVentPlugA) {
            setStartIndex(8);
        } else if (dropdowns.warnaVentPlugS || dropdowns.warnaVentPlugA) {
            setStartIndex(9);
        }
    }, [
        dropdowns
    ]);

    //container
    useEffect(() => {
        if (dropdowns.warnaContainerS || dropdowns.warnaContainerA) {
            setStartIndex(0);
        } else if (dropdowns.markBrandContainerS || dropdowns.markBrandContainerA) {
            setStartIndex(1);
        } else if (dropdowns.markTypeS || dropdowns.markTypeA) {
            setStartIndex(2);
        } else if (dropdowns.stickerContainerS || dropdowns.stickerContainerA) {
            setStartIndex(5);
        }
    }, [
        dropdowns
    ]);

    //Master Box / K.Box
    useEffect(() => {
        if (dropdowns.masterBoxStickerS || dropdowns.masterBoxStickerA) {
            setStartIndex(1);
        } else if (dropdowns.masterBoxMarkBrandS || dropdowns.masterBoxMarkBrandA) {
            setStartIndex(2);
        } else if (dropdowns.masterBoxMarkTypeS || dropdowns.masterBoxMarkTypeA) {
            setStartIndex(3);
        } else if (dropdowns.masterBoxMarkSpecS || dropdowns.masterBoxMarkSpecA) {
            setStartIndex(4);
        } else if (dropdowns.masterBoxStamp) {
            setStartIndex(6);
        }
    }, [
        dropdowns
    ]);

    //Accessories
    useEffect(() => {
        if (dropdowns.warrantyCardS || dropdowns.warrantyCardA) {
            setStartIndex(0);
        } else if (dropdowns.instructionManualLabelS || dropdowns.instructionManualLabelA) {
            setStartIndex(1);
        } else if (dropdowns.elbowS || dropdowns.elbowA) {
            setStartIndex(2);
        }
    }, [
        dropdowns
    ]);


    
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

    //BatteryInformation ganti value
    const debouncedUpdateBatteryInfo = useCallback(
        debounce(async (changedValues) => {
            try {
                const updateResponse = await fetch(`http://10.19.101.166:3003/updateInformasiBattery/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(changedValues)
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update information');
                }

                const responseData = await updateResponse.json();
                console.log('Informasi Battery updated successfully:', responseData);
                // Assuming you want to handle the changeModifDate function here
                changeModifDate();
            } catch (error) {
                console.error('Error updating information:', error);
            }
        }, 500),
        [id]
    );
    const previousValuesRef = useRef({
        brand_battery: valueBrandBatteryA,
        no_dok_pcb: noDokPCB,
        negara_tujuan: valueNegaraTujuanA,
        customer: valueCustomerA
    });
    useEffect(() => {
        if (!loading) {
            const updatedValues = {};
            const previousValues = previousValuesRef.current;

            if (valueBrandBatteryA !== previousValues.brand_battery) updatedValues.brand_battery = valueBrandBatteryA;
            if (noDokPCB !== previousValues.no_dok_pcb) updatedValues.no_dok_pcb = noDokPCB;
            if (valueNegaraTujuanA !== previousValues.negara_tujuan) updatedValues.negara_tujuan = valueNegaraTujuanA;
            if (valueCustomerA !== previousValues.customer) updatedValues.customer = valueCustomerA;

            if (Object.keys(updatedValues).length > 0) {
                debouncedUpdateBatteryInfo(updatedValues);
            }

            // Update previous values reference
            previousValuesRef.current = {
                brand_battery: valueBrandBatteryA,
                no_dok_pcb: noDokPCB,
                negara_tujuan: valueNegaraTujuanA,
                customer: valueCustomerA
            };
        }
    }, [loading, valueBrandBatteryA, valueNegaraTujuanA, valueCustomerA, noDokPCB, debouncedUpdateBatteryInfo]);
    const [valueBrandBatteryAFirst, setValueBrandBatteryAFirst] = useState(true);
    const [valueNegaraTujuanAFirst, setValueNegaraTujuanAFirst] = useState(true);
    const [valueCustomerAFirst, setValueCustomerAFirst] = useState(true);
    const [typeBatteryFirst, setTypeBatteryFirst] = useState(true);
    const [noDokPCBFirst, setNoDokPCBFirst] = useState(true);
    const [itemNumberFirst, setItemNumberFirst] = useState(true);
    useEffect(() => {
        setBatteryInformationPosition((prevPosition) => {
            let newPosition = prevPosition;

            // Check valueBrandBatteryA
            if (valueBrandBatteryAFirst && valueBrandBatteryA !== '' && valueBrandBatteryA !== null && valueBrandBatteryA !== undefined && valueBrandBatteryA !== true) {
                newPosition++;
                setValueBrandBatteryAFirst(false);
            } else if (valueBrandBatteryA === '' && !valueBrandBatteryAFirst) {
                newPosition--;
                setValueBrandBatteryAFirst(true);
            }

            // Check valueNegaraTujuanA
            if (valueNegaraTujuanAFirst && valueNegaraTujuanA !== '' && valueNegaraTujuanA !== null && valueNegaraTujuanA !== undefined && valueNegaraTujuanA !== true) {
                newPosition++;
                setValueNegaraTujuanAFirst(false);
            } else if (valueNegaraTujuanA === '' && !valueNegaraTujuanAFirst) {
                newPosition--;
                setValueNegaraTujuanAFirst(true);
            }

            // Check valueCustomerA
            if (valueCustomerAFirst && valueCustomerA !== '' && valueCustomerA !== null && valueCustomerA !== undefined && valueCustomerA !== true) {
                newPosition++;
                setValueCustomerAFirst(false);
            } else if (valueCustomerA === '' && !valueCustomerAFirst) {
                newPosition--;
                setValueCustomerAFirst(true);
            }

            // Check noDokPCB
            if (noDokPCB !== '' && noDokPCBFirst) {
                newPosition++;
                setNoDokPCBFirst(false);
            } else if (noDokPCB === '' && !noDokPCBFirst) {
                newPosition--;
                setNoDokPCBFirst(true);
            }

            // Check typeBattery
            if (typeBattery !== '' && typeBatteryFirst) {
                newPosition++;
                setTypeBatteryFirst(false);
            } else if (typeBattery === '' && !typeBatteryFirst) {
                newPosition--;
                setTypeBatteryFirst(true);
            }

            // Check itemNumber
            if (itemNumber !== '' && itemNumberFirst) {
                newPosition++;
                setItemNumberFirst(false);
            } else if (itemNumber === '' && !itemNumberFirst) {
                newPosition--;
                setItemNumberFirst(true);
            }

            return newPosition;
        });
    }, [
        valueBrandBatteryA, valueNegaraTujuanA, valueCustomerA, typeBattery, noDokPCB, itemNumber,
        valueBrandBatteryAFirst, valueNegaraTujuanAFirst, valueCustomerAFirst, typeBatteryFirst,
        noDokPCBFirst, itemNumberFirst
    ]);


    //Packing ganti value
    const debouncedUpdatePackingInfo = useCallback(
        debounce(async (changedValues) => {
            try {
                const updateResponse = await fetch(`http://10.19.101.166:3003/updatePacking/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(changedValues)
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update information');
                }

                console.log('Packing updated successfully');
                // Assuming you want to handle the changeModifDate function here
                changeModifDate();
            } catch (error) {
                console.error('Error updating information:', error);
            }
        }, 500),
        [id]
    );
    const previousValuesRefPacking = useRef({
        jumlah_batterypalet_standard: jumlahBatteryPaletS,
        jumlah_batterypalet_actual: jumlahBatteryPaletA,
        kondisi_susunanbattery: kondisiSusunanBattery,
        kondisi_ikatan: kondisiIkatan,
        type_palletno_standard: valueTypePalletS,
        type_palletno_actual: valueTypePalletA,
        tampilan_palet: tampilanPallet,
        styrophore_karton_triplex_standard: valueStyrophoreKartonTriplexS,
        styrophore_karton_triplex_actual: valueStyrophoreKartonTriplexA,
        inspection_tag: inspectionTag,
        shiping_mark: shipingMark,
        label_produksi: labelProduksi,
        plastik_shrink: plastikShrink,
        kesesuaian_tag: kesesuaianTag
    });
    useEffect(() => {
        if (!loading) {
            const updatedValues = {};
            const previousValues = previousValuesRefPacking.current;

            if (jumlahBatteryPaletS !== previousValues.jumlah_batterypalet_standard) updatedValues.jumlah_batterypalet_standard = jumlahBatteryPaletS;
            if (jumlahBatteryPaletA !== previousValues.jumlah_batterypalet_actual) updatedValues.jumlah_batterypalet_actual = jumlahBatteryPaletA;
            if (kondisiSusunanBattery !== previousValues.kondisi_susunanbattery) updatedValues.kondisi_susunanbattery = kondisiSusunanBattery;
            if (kondisiIkatan !== previousValues.kondisi_ikatan) updatedValues.kondisi_ikatan = kondisiIkatan;
            if (valueTypePalletS !== previousValues.type_palletno_standard) updatedValues.type_palletno_standard = valueTypePalletS;
            if (valueTypePalletA !== previousValues.type_palletno_actual) updatedValues.type_palletno_actual = valueTypePalletA;
            if (tampilanPallet !== previousValues.tampilan_palet) updatedValues.tampilan_palet = tampilanPallet;
            if (valueStyrophoreKartonTriplexS !== previousValues.styrophore_karton_triplex_standard) updatedValues.styrophore_karton_triplex_standard = valueStyrophoreKartonTriplexS;
            if (valueStyrophoreKartonTriplexA !== previousValues.styrophore_karton_triplex_actual) updatedValues.styrophore_karton_triplex_actual = valueStyrophoreKartonTriplexA;
            if (inspectionTag !== previousValues.inspection_tag) updatedValues.inspection_tag = inspectionTag;
            if (shipingMark !== previousValues.shiping_mark) updatedValues.shiping_mark = shipingMark;
            if (labelProduksi !== previousValues.label_produksi) updatedValues.label_produksi = labelProduksi;
            if (plastikShrink !== previousValues.plastik_shrink) updatedValues.plastik_shrink = plastikShrink;
            if (kesesuaianTag !== previousValues.kesesuaian_tag) updatedValues.kesesuaian_tag = kesesuaianTag;

            if (Object.keys(updatedValues).length > 0) {
                debouncedUpdatePackingInfo(updatedValues);
            }

            // Update previous values reference
            previousValuesRefPacking.current = {
                jumlah_batterypalet_standard: jumlahBatteryPaletS,
                jumlah_batterypalet_actual: jumlahBatteryPaletA,
                kondisi_susunanbattery: kondisiSusunanBattery,
                kondisi_ikatan: kondisiIkatan,
                type_palletno_standard: valueTypePalletS,
                type_palletno_actual: valueTypePalletA,
                tampilan_palet: tampilanPallet,
                styrophore_karton_triplex_standard: valueStyrophoreKartonTriplexS,
                styrophore_karton_triplex_actual: valueStyrophoreKartonTriplexA,
                inspection_tag: inspectionTag,
                shiping_mark: shipingMark,
                label_produksi: labelProduksi,
                plastik_shrink: plastikShrink,
                kesesuaian_tag: kesesuaianTag
            };
        }
    }, [
        loading,
        jumlahBatteryPaletS,
        jumlahBatteryPaletA,
        kondisiSusunanBattery,
        kondisiIkatan,
        valueTypePalletS,
        valueTypePalletA,
        tampilanPallet,
        valueStyrophoreKartonTriplexS,
        valueStyrophoreKartonTriplexA,
        inspectionTag,
        shipingMark,
        labelProduksi,
        plastikShrink,
        kesesuaianTag,
        debouncedUpdatePackingInfo
    ]);
    const [jumlahBatteryPaletSFirst, setJumlahBatteryPaletSFirst] = useState(true);
    const [jumlahBatteryPaletAFirst, setJumlahBatteryPaletAFirst] = useState(true);
    const [kondisiSusunanBatteryFirst, setKondisiSusunanBatteryFirst] = useState(true);
    const [kondisiIkatanFirst, setKondisiIkatanFirst] = useState(true);
    const [typePalletSFirst, setTypePalletSFirst] = useState(true);
    const [typePalletAFirst, setTypePalletAFirst] = useState(true);
    const [tampilanPalletFirst, setTampilanPalletFirst] = useState(true);
    const [valueStyrophoreKartonTriplexSFirst, setValueStyrophoreKartonTriplexSFirst] = useState(true);
    const [valueStyrophoreKartonTriplexAFirst, setValueStyrophoreKartonTriplexAFirst] = useState(true);
    const [inspectionTagFirst, setInspectionTagFirst] = useState(true);
    const [shipingMarkFirst, setShipingMarkFirst] = useState(true);
    const [labelProduksiFirst, setLabelProduksiFirst] = useState(true);
    const [plastikShrinkFirst, setPlastikShrinkFirst] = useState(true);
    const [kesesuaianTagFirst, setKesesuaianTagFirst] = useState(true);
    useEffect(() => {
        setPackingPosition((prevPosition) => {
            let newPosition = prevPosition;

            // Check jumlahBatteryPalet
            if (jumlahBatteryPaletS !== '' && jumlahBatteryPaletA !== '' && (jumlahBatteryPaletSFirst || jumlahBatteryPaletAFirst)) {
                newPosition++;
                setJumlahBatteryPaletSFirst(false);
                setJumlahBatteryPaletAFirst(false);
            } else if (jumlahBatteryPaletS === '' && jumlahBatteryPaletA === '' && !loading && !jumlahBatteryPaletAFirst) {
                newPosition--;
                setJumlahBatteryPaletSFirst(true);
                setJumlahBatteryPaletAFirst(true);
            }

            // Check kondisiSusunanBattery
            if (kondisiSusunanBatteryFirst && kondisiSusunanBattery !== '') {
                newPosition++;
                setKondisiSusunanBatteryFirst(false);
            } else if (kondisiSusunanBattery === '' && !loading && !kondisiSusunanBatteryFirst) {
                newPosition--;
                setKondisiSusunanBatteryFirst(true);
            }

            // Check kondisiIkatan
            if (kondisiIkatanFirst && kondisiIkatan !== '') {
                newPosition++;
                setKondisiIkatanFirst(false);
            } else if (kondisiIkatan === '' && !loading && !kondisiIkatanFirst) {
                newPosition--;
                setKondisiIkatanFirst(true);
            }

            // Check typePallet
            if (typePalletSFirst) {
                if (valueTypePalletS !== null && valueTypePalletS !== '' && valueTypePalletS !== undefined &&
                    valueTypePalletA !== null && valueTypePalletA !== '' && valueTypePalletA !== undefined) {
                    newPosition++;
                    setTypePalletSFirst(false);
                } else if ((valueTypePalletS === null || valueTypePalletS === '' || valueTypePalletS === undefined) &&
                    (valueTypePalletA === null || valueTypePalletA === '' || valueTypePalletA === undefined) &&
                    !loading && !typePalletSFirst) {
                    newPosition--;
                    setTypePalletSFirst(true);
                }
            }

            // Check tampilanPallet
            if (tampilanPalletFirst && tampilanPallet !== '') {
                newPosition++;
                setTampilanPalletFirst(false);
            } else if (tampilanPallet === '' && !loading && !tampilanPalletFirst) {
                newPosition--;
                setTampilanPalletFirst(true);
            }

            // Check valueStyrophoreKartonTriplex
            if (valueStyrophoreKartonTriplexSFirst) {
                if (valueStyrophoreKartonTriplexS !== null && valueStyrophoreKartonTriplexS !== '' && valueStyrophoreKartonTriplexS !== undefined &&
                    valueStyrophoreKartonTriplexA !== null && valueStyrophoreKartonTriplexA !== '' && valueStyrophoreKartonTriplexA !== undefined) {
                    newPosition++;
                    setValueStyrophoreKartonTriplexSFirst(false);
                } else if ((valueStyrophoreKartonTriplexS === null || valueStyrophoreKartonTriplexS === '' || valueStyrophoreKartonTriplexS === undefined) &&
                    (valueStyrophoreKartonTriplexA === null || valueStyrophoreKartonTriplexA === '' || valueStyrophoreKartonTriplexA === undefined) &&
                    !loading && !valueStyrophoreKartonTriplexSFirst) {
                    newPosition--;
                    setValueStyrophoreKartonTriplexSFirst(true);
                }
            }

            // Check inspectionTag
            if (inspectionTagFirst && inspectionTag !== '') {
                newPosition++;
                setInspectionTagFirst(false);
            } else if (inspectionTag === '' && !loading && !inspectionTagFirst) {
                newPosition--;
                setInspectionTagFirst(true);
            }

            // Check shipingMark
            if (shipingMarkFirst && shipingMark !== '') {
                newPosition++;
                setShipingMarkFirst(false);
            } else if (shipingMark === '' && !loading && !shipingMarkFirst) {
                newPosition--;
                setShipingMarkFirst(true);
            }

            // Check labelProduksi
            if (labelProduksiFirst && labelProduksi !== '') {
                newPosition++;
                setLabelProduksiFirst(false);
            } else if (labelProduksi === '' && !loading && !labelProduksiFirst) {
                newPosition--;
                setLabelProduksiFirst(true);
            }

            // Check plastikShrink
            if (plastikShrinkFirst && plastikShrink !== '') {
                newPosition++;
                setPlastikShrinkFirst(false);
            } else if (plastikShrink === '' && !loading && !plastikShrinkFirst) {
                newPosition--;
                setPlastikShrinkFirst(true);
            }

            // Check kesesuaianTag
            if (kesesuaianTagFirst && kesesuaianTag !== '') {
                newPosition++;
                setKesesuaianTagFirst(false);
            } else if (kesesuaianTag === '' && !loading && !kesesuaianTagFirst) {
                newPosition--;
                setKesesuaianTagFirst(true);
            }

            return newPosition;
        });
    }, [
        loading, jumlahBatteryPaletS, jumlahBatteryPaletA, kondisiSusunanBattery, kondisiIkatan, valueTypePalletS, valueTypePalletA, tampilanPallet,
        valueStyrophoreKartonTriplexS, valueStyrophoreKartonTriplexA, inspectionTag, shipingMark, labelProduksi, plastikShrink, kesesuaianTag,
        jumlahBatteryPaletSFirst, jumlahBatteryPaletAFirst, kondisiSusunanBatteryFirst, kondisiIkatanFirst, typePalletSFirst, tampilanPalletFirst,
        valueStyrophoreKartonTriplexSFirst, inspectionTagFirst, shipingMarkFirst, labelProduksiFirst, plastikShrinkFirst, kesesuaianTagFirst
    ]);

    // useEffect(() => {
    //     if (valueTypeVentPlugAFirst) {
    //         let currentPackingPosition = packingPosition;
    //         if ((valueTypeVentPlugS !== null && valueTypeVentPlugS !== '') && (valueTypeVentPlugA !== null && valueTypeVentPlugA !== '')) {
    //             currentPackingPosition++;
    //             setValueTypeVentPlugAFirst(false);
    //         }

    //         setPackingPosition(currentPackingPosition);
    //     }
    // }, [valueTypeVentPlugS, valueTypeVentPlugA]);

    //Cover ganti value
    const debouncedUpdateCoverInfo = useCallback(
        debounce(async (changedValues) => {
            try {
                const updateResponse = await fetch(`http://10.19.101.166:3003/updateCover/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(changedValues)
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update information');
                }

                const responseData = await updateResponse.json();
                // Assuming you want to handle the changeModifDate function here
                changeModifDate();
                console.log('Cover updated successfully', responseData);
            } catch (error) {
                console.error('Error updating information:', error);
            }
        }, 500),
        [id]
    );
    const previousValuesRefCover = useRef({
        warna_cover_standard: valueWarnaCoverS,
        warna_cover_actual: valueWarnaCoverA,
        tampilan_terminal: tampilanTerminal,
        kode_produksi: kodeProduksi,
        brand_mark_standard: valueBrandMarkS,
        brand_mark_actual: valueBrandMarkA,
        tampilan_cover: tampilanCover,
        kode_finishing_actual: kodeFinishing,
        sticker_standard: valueStickerCoverS,
        sticker_actual: valueStickerCoverA,
        type_vent_plug_standard: valueTypeVentPlugS,
        type_vent_plug_actual: valueTypeVentPlugA,
        warna_vent_plug_standard: valueWarnaVentPlugS,
        warna_vent_plug_actual: valueWarnaVentPlugA,
        tampilan_vent_plug: tampilanVentPlug,
        indicator_electrolite: indicatorElectrolite,
        type_battery_actual: coverTypeBatteryA
    });
    useEffect(() => {
        if (!loading) {
            const updatedValues = {};
            const previousValues = previousValuesRefCover.current;

            if (valueWarnaCoverS !== previousValues.warna_cover_standard) updatedValues.warna_cover_standard = valueWarnaCoverS;
            if (valueWarnaCoverA !== previousValues.warna_cover_actual) updatedValues.warna_cover_actual = valueWarnaCoverA;
            if (tampilanTerminal !== previousValues.tampilan_terminal) updatedValues.tampilan_terminal = tampilanTerminal;
            if (kodeProduksi !== previousValues.kode_produksi) updatedValues.kode_produksi = kodeProduksi;
            if (valueBrandMarkS !== previousValues.brand_mark_standard) updatedValues.brand_mark_standard = valueBrandMarkS;
            if (valueBrandMarkA !== previousValues.brand_mark_actual) updatedValues.brand_mark_actual = valueBrandMarkA;  
            if (tampilanCover !== previousValues.tampilan_cover) updatedValues.tampilan_cover = tampilanCover;
            if (kodeFinishing !== previousValues.kode_finishing_actual) updatedValues.kode_finishing_actual = kodeFinishing;
            if (valueStickerCoverS !== previousValues.sticker_standard) updatedValues.sticker_standard = valueStickerCoverS;
            if (valueStickerCoverA !== previousValues.sticker_actual) updatedValues.sticker_actual = valueStickerCoverA;
            if (valueTypeVentPlugS !== previousValues.type_vent_plug_standard) updatedValues.type_vent_plug_standard = valueTypeVentPlugS;
            if (valueTypeVentPlugA !== previousValues.type_vent_plug_actual) updatedValues.type_vent_plug_actual = valueTypeVentPlugA;
            if (valueWarnaVentPlugS !== previousValues.warna_vent_plug_standard) updatedValues.warna_vent_plug_standard = valueWarnaVentPlugS;
            if (valueWarnaVentPlugA !== previousValues.warna_vent_plug_actual) updatedValues.warna_vent_plug_actual = valueWarnaVentPlugA;
            if (tampilanVentPlug !== previousValues.tampilan_vent_plug) updatedValues.tampilan_vent_plug = tampilanVentPlug;
            if (indicatorElectrolite !== previousValues.indicator_electrolite) updatedValues.indicator_electrolite = indicatorElectrolite;
            if (coverTypeBatteryA !== previousValues.type_battery_actual) updatedValues.type_battery_actual = coverTypeBatteryA;


            if (Object.keys(updatedValues).length > 0) {
                debouncedUpdateCoverInfo(updatedValues);
            }

            // Update previous values reference
            previousValuesRefCover.current = {
                warna_cover_standard: valueWarnaCoverS,
                warna_cover_actual: valueWarnaCoverA,
                tampilan_terminal: tampilanTerminal,
                kode_produksi: kodeProduksi,
                brand_mark_standard: valueBrandMarkS,
                brand_mark_actual: valueBrandMarkA,
                tampilan_cover: tampilanCover,
                kode_finishing_actual: kodeFinishing,
                sticker_standard: valueStickerCoverS,
                sticker_actual: valueStickerCoverA,
                type_vent_plug_standard: valueTypeVentPlugS,
                type_vent_plug_actual: valueTypeVentPlugA,
                warna_vent_plug_standard: valueWarnaVentPlugS,
                warna_vent_plug_actual: valueWarnaVentPlugA,
                tampilan_vent_plug: tampilanVentPlug,
                indicator_electrolite: indicatorElectrolite,
                type_battery_actual: coverTypeBatteryA
            };
        }
    }, [
        loading,
        valueWarnaCoverS,
        valueWarnaCoverA,
        tampilanTerminal,
        kodeProduksi,
        valueBrandMarkS,
        valueBrandMarkA,
        tampilanCover,
        kodeFinishing,
        valueStickerCoverS,
        valueStickerCoverA,
        valueTypeVentPlugS,
        valueTypeVentPlugA,
        valueWarnaVentPlugS,
        valueWarnaVentPlugA,
        tampilanVentPlug,
        indicatorElectrolite,
        coverTypeBatteryA,
        debouncedUpdateCoverInfo
    ]);
    const [valueWarnaCoverSFirst, setValueWarnaCoverSFirst] = useState(true);
    const [valueWarnaCoverAFirst, setValueWarnaCoverAFirst] = useState(true);
    const [tampilanTerminalFirst, setTampilanTerminalFirst] = useState(true);
    const [posisiTerminalFirst, setPosisiTerminalFirst] = useState(true);
    const [valueBrandMarkSFirst, setValueBrandMarkSFirst] = useState(true);
    const [valueBrandMarkAFirst, setValueBrandMarkAFirst] = useState(true);
    const [tampilanCoverFirst, setTampilanCoverFirst] = useState(true);
    const [kodeFinishingFirst, setKodeFinishingFirst] = useState(true);
    const [valueStickerCoverSFirst, setValueStickerCoverSFirst] = useState(true);
    const [valueStickerCoverAFirst, setValueStickerCoverAFirst] = useState(true);
    const [valueTypeVentPlugSFirst, setValueTypeVentPlugSFirst] = useState(true);
    const [valueTypeVentPlugAFirst, setValueTypeVentPlugAFirst] = useState(true);
    const [valueWarnaVentPlugSFirst, setValueWarnaVentPlugSFirst] = useState(true);
    const [valueWarnaVentPlugAFirst, setValueWarnaVentPlugAFirst] = useState(true);
    const [valueCoverTypeBatteryFirst, setValueCoverTypeBatteryFirst] = useState(true);
    const [tampilanVentPlugFirst, setTampilanVentPlugFirst] = useState(true);
    const [indicatorElectroliteFirst, setIndicatorElectroliteFirst] = useState(true);
    const [kodeProduksiFirst, setKodeProduksiFirst] = useState(true);
    useEffect(() => {
        setCoverPosition((prevPosition) => {
            let newPosition = prevPosition;

            // Check valueWarnaCover
            if (valueWarnaCoverAFirst) {
                if (valueWarnaCoverS !== null && valueWarnaCoverS !== '' && valueWarnaCoverA !== null && valueWarnaCoverA !== '') {
                    newPosition++;
                    setValueWarnaCoverAFirst(false);
                }
            }

            // Check tampilanTerminal
            if (tampilanTerminal !== '' && tampilanTerminalFirst) {
                newPosition++;
                setTampilanTerminalFirst(false);
            } else if (tampilanTerminal === '' && !loading && !tampilanTerminalFirst) {
                newPosition--;
                setTampilanTerminalFirst(true);
            }

            // Check kodeProduksi
            if (kodeProduksi !== '' && kodeProduksiFirst) {
                newPosition++;
                setKodeProduksiFirst(false);
            } else if (kodeProduksi === '' && !loading && !kodeProduksiFirst) {
                newPosition--;
                setKodeProduksiFirst(true);
            }

            // Check valueBrandMark
            if (valueBrandMarkAFirst) {
                if (valueBrandMarkS !== null && valueBrandMarkS !== '' && valueBrandMarkS !== undefined && valueBrandMarkA !== null && valueBrandMarkA !== '' && valueBrandMarkA !== undefined) {
                    newPosition++;
                    setValueBrandMarkAFirst(false);
                }
            }

            // Check tampilanCover
            if (tampilanCover !== '' && tampilanCoverFirst) {
                newPosition++;
                setTampilanCoverFirst(false);
            } else if (tampilanCover === '' && !loading && !tampilanCoverFirst) {
                newPosition--;
                setTampilanCoverFirst(true);
            }

            // Check kodeFinishing
            if (kodeFinishing !== '' && kodeFinishingFirst) {
                newPosition++;
                setKodeFinishingFirst(false);
            } else if (kodeFinishing === '' && !loading && !kodeFinishingFirst) {
                newPosition--;
                setKodeFinishingFirst(true);
            }

            // Check valueStickerCover
            if ((valueStickerCoverS.length !== 0 && valueStickerCoverA.length !== 0) && (valueStickerCoverSFirst || valueStickerCoverAFirst)) {
                newPosition++;
                setValueStickerCoverSFirst(false);
                setValueStickerCoverAFirst(false);
            } else if (valueStickerCoverS.length === 0 && valueStickerCoverA.length === 0 && !valueStickerCoverSFirst) {
                newPosition--;
                setValueStickerCoverSFirst(true);
                setValueStickerCoverAFirst(true);
            }

            // Check valueTypeVentPlug
            if (valueTypeVentPlugAFirst) {
                if (valueTypeVentPlugS !== null && valueTypeVentPlugS !== '' && valueTypeVentPlugS !== undefined && valueTypeVentPlugA !== null && valueTypeVentPlugA !== '' && valueTypeVentPlugA !== undefined) {
                    newPosition++;
                    setValueTypeVentPlugAFirst(false);
                }
            }

            // Check valueWarnaVentPlug
            if (valueWarnaVentPlugAFirst) {
                if (valueWarnaVentPlugS !== null && valueWarnaVentPlugS !== '' && valueWarnaVentPlugS !== undefined && valueWarnaVentPlugA !== null && valueWarnaVentPlugA !== '' && valueWarnaVentPlugA !== undefined) {
                    newPosition++;
                    setValueWarnaVentPlugAFirst(false);
                }
            }

            // Check tampilanVentPlug
            if (tampilanVentPlug !== '' && tampilanVentPlugFirst) {
                newPosition++;
                setTampilanVentPlugFirst(false);
            } else if (tampilanVentPlug === '' && !loading && !tampilanVentPlugFirst) {
                newPosition--;
                setTampilanVentPlugFirst(true);
            }

            // Check indicatorElectrolite
            if (indicatorElectrolite !== '' && indicatorElectroliteFirst) {
                newPosition++;
                setIndicatorElectroliteFirst(false);
            } else if (indicatorElectrolite === '' && !loading && !indicatorElectroliteFirst) {
                newPosition--;
                setIndicatorElectroliteFirst(true);
            }

            // Check coverTypeBattery
            if (coverTypeBatteryS !== '' && coverTypeBatteryA !== '' && valueCoverTypeBatteryFirst) {
                newPosition++;
                setValueCoverTypeBatteryFirst(false);
            } else if (coverTypeBatteryS === '' && coverTypeBatteryA !== '' && !loading && !valueCoverTypeBatteryFirst) {
                newPosition--;
                setValueCoverTypeBatteryFirst(true);
            }

            return newPosition;
        });
    }, [
        loading, valueWarnaCoverS, valueWarnaCoverA, tampilanTerminal, kodeProduksi, valueBrandMarkS, valueBrandMarkA, tampilanCover,
        kodeFinishing, valueStickerCoverS, valueStickerCoverA, valueTypeVentPlugS, valueTypeVentPlugA, valueWarnaVentPlugS, valueWarnaVentPlugA,
        tampilanVentPlug, indicatorElectrolite, coverTypeBatteryS, coverTypeBatteryA, valueWarnaCoverAFirst, tampilanTerminalFirst,
        kodeProduksiFirst, valueBrandMarkAFirst, tampilanCoverFirst, kodeFinishingFirst, valueStickerCoverSFirst, valueStickerCoverAFirst,
        valueTypeVentPlugAFirst, valueWarnaVentPlugAFirst, tampilanVentPlugFirst, indicatorElectroliteFirst, valueCoverTypeBatteryFirst
    ]);

    // useEffect(() => {
    //     let currentCoverPosition = coverPosition;

    //     if ((posisiTerminal !== '') && (posisiTerminalFirst)) {
    //         currentCoverPosition++;
    //         setPosisiTerminalFirst(false);
    //     } else if (posisiTerminal === '') {
    //         currentCoverPosition--;
    //         setPosisiTerminalFirst(true);
    //     }

    //     setCoverPosition(currentCoverPosition);
    // }, [
    //     posisiTerminal
    // ]);


    //Container ganti value
    const debouncedUpdateContainerInfo = useCallback(
        debounce(async (changedValues) => {
            try {
                const updateResponse = await fetch(`http://10.19.101.166:3003/updateContainer/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(changedValues)
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update information');
                }

                // Assuming you want to handle the changeModifDate function here
                changeModifDate();
            } catch (error) {
                console.error('Error updating information:', error);
            }
        }, 500),
        [id]
    );
    const previousValuesRefContainer = useRef({
        warna_container_standard: valueWarnaContainerS,
        warna_container_actual: valueWarnaContainerA,
        mark_brand_standard: valueMarkBrandContainerS,
        mark_brand_actual: valueMarkBrandContainerA,
        mark_type_standard: valueMarkTypeS,
        mark_type_actual: valueMarkTypeA,
        upperlower_level: upperLower,
        tampilan_container: tampilanContainer,
        sticker_standard: valueStickerContainerS,
        sticker_actual: valueStickerContainerA
    });
    useEffect(() => {
        if (!loading) {
            const updatedValues = {};
            const previousValues = previousValuesRefContainer.current;

            if (valueWarnaContainerS !== previousValues.warna_container_standard) updatedValues.warna_container_standard = valueWarnaContainerS;
            if (valueWarnaContainerA !== previousValues.warna_container_actual) updatedValues.warna_container_actual = valueWarnaContainerA;
            if (valueMarkBrandContainerS !== previousValues.mark_brand_standard) updatedValues.mark_brand_standard = valueMarkBrandContainerS;
            if (valueMarkBrandContainerA !== previousValues.mark_brand_actual) updatedValues.mark_brand_actual = valueMarkBrandContainerA;
            if (valueMarkTypeS !== previousValues.mark_type_standard) updatedValues.mark_type_standard = valueMarkTypeS;
            if (valueMarkTypeA !== previousValues.mark_type_actual) updatedValues.mark_type_actual = valueMarkTypeA;
            if (upperLower !== previousValues.upperlower_level) updatedValues.upperlower_level = upperLower;
            if (tampilanContainer !== previousValues.tampilan_container) updatedValues.tampilan_container = tampilanContainer;
            if (valueStickerContainerS !== previousValues.sticker_standard) updatedValues.sticker_standard = valueStickerContainerS;
            if (valueStickerContainerA !== previousValues.sticker_actual) updatedValues.sticker_actual = valueStickerContainerA;

            if (Object.keys(updatedValues).length > 0) {
                debouncedUpdateContainerInfo(updatedValues);
            }

            // Update previous values reference
            previousValuesRefContainer.current = {
                warna_container_standard: valueWarnaContainerS,
                warna_container_actual: valueWarnaContainerA,
                mark_brand_standard: valueMarkBrandContainerS,
                mark_brand_actual: valueMarkBrandContainerA,
                mark_type_standard: valueMarkTypeS,
                mark_type_actual: valueMarkTypeA,
                upperlower_level: upperLower,
                tampilan_container: tampilanContainer,
                sticker_standard: valueStickerContainerS,
                sticker_actual: valueStickerContainerA
            };
        }
    }, [
        loading,
        valueWarnaContainerS,
        valueWarnaContainerA,
        valueMarkBrandContainerS,
        valueMarkBrandContainerA,
        valueMarkTypeS,
        valueMarkTypeA,
        upperLower,
        tampilanContainer,
        valueStickerContainerS,
        valueStickerContainerA,
        debouncedUpdateContainerInfo
    ]);
    const [valueWarnaContainerSFirst, setValueWarnaContainerSFirst] = useState(true);
    const [valueWarnaContainerAFirst, setValueWarnaContainerAFirst] = useState(true);
    const [valueMarkBrandContainerSFirst, setValueMarkBrandContainerSFirst] = useState(true);
    const [valueMarkBrandContainerAFirst, setValueMarkBrandContainerAFirst] = useState(true);
    const [valueMarkTypeSFirst, setValueMarkTypeSFirst] = useState(true);
    const [valueMarkTypeAFirst, setValueMarkTypeAFirst] = useState(true);
    const [upperLowerFirst, setUpperLowerFirst] = useState(true);
    const [tampilanContainerFirst, setTampilanContainerFirst] = useState(true);
    const [valueMarkSpecSFirst, setValueMarkSpecSFirst] = useState(true);
    const [valueMarkSpecAFirst, setValueMarkSpecAFirst] = useState(true);
    const [stampSFirst, setStampSFirst] = useState(true);
    const [stampAFirst, setStampAFirst] = useState(true);
    const [valueStickerContainerSFirst, setValueStickerContainerSFirst] = useState(true);
    const [valueStickerContainerAFirst, setValueStickerContainerAFirst] = useState(true);
    useEffect(() => {
        setContainerPosition((prevPosition) => {
            let newPosition = prevPosition;

            // Check valueWarnaContainer
            if (valueWarnaContainerAFirst) {
                if (valueWarnaContainerS !== null && valueWarnaContainerS !== '' && valueWarnaContainerS !== undefined && valueWarnaContainerA !== null && valueWarnaContainerA !== '' && valueWarnaContainerA !== undefined) {
                    newPosition++;
                    setValueWarnaContainerAFirst(false);
                }
            }

            // Check valueMarkBrandContainer
            if (valueMarkBrandContainerAFirst) {
                if (valueMarkBrandContainerS !== null && valueMarkBrandContainerS !== '' && valueMarkBrandContainerS !== undefined && valueMarkBrandContainerA !== null && valueMarkBrandContainerA !== '' && valueMarkBrandContainerA !== undefined) {
                    newPosition++;
                    setValueMarkBrandContainerAFirst(false);
                }
            }

            // Check valueMarkType
            if (valueMarkTypeAFirst) {
                if (valueMarkTypeS !== null && valueMarkTypeS !== '' && valueMarkTypeS !== undefined && valueMarkTypeA !== null && valueMarkTypeA !== '' && valueMarkTypeA !== undefined) {
                    newPosition++;
                    setValueMarkTypeAFirst(false);
                }
            }

            // Check upperLower
            if (upperLower !== '' && upperLowerFirst) {
                newPosition++;
                setUpperLowerFirst(false);
            } else if (upperLower === '' && !loading && !upperLowerFirst) {
                newPosition--;
                setUpperLowerFirst(true);
            }

            // Check tampilanContainer
            if (tampilanContainer !== '' && tampilanContainerFirst) {
                newPosition++;
                setTampilanContainerFirst(false);
            } else if (tampilanContainer === '' && !loading && !tampilanContainerFirst) {
                newPosition--;
                setTampilanContainerFirst(true);
            }

            // Check valueStickerContainer
            if ((valueStickerContainerS.length !== 0 && valueStickerContainerA.length !== 0) && (valueStickerContainerSFirst || valueStickerContainerAFirst)) {
                newPosition++;
                setValueStickerContainerSFirst(false);
                setValueStickerContainerAFirst(false);
            } else if (valueStickerContainerS.length === 0 && valueStickerContainerA.length === 0 && !valueStickerContainerAFirst) {
                newPosition--;
                setValueStickerContainerSFirst(true);
                setValueStickerContainerAFirst(true);
            }

            return newPosition;
        });
    }, [
        loading, valueWarnaContainerS, valueWarnaContainerA, valueMarkBrandContainerS, valueMarkBrandContainerA, valueMarkTypeS, valueMarkTypeA,
        upperLower, tampilanContainer, valueStickerContainerS, valueStickerContainerA, valueWarnaContainerAFirst, valueMarkBrandContainerAFirst,
        valueMarkTypeAFirst, upperLowerFirst, tampilanContainerFirst, valueStickerContainerSFirst, valueStickerContainerAFirst
    ]);
    // useEffect(() => {
    //     let currentContainerPosition = containerPosition;

    //     if (valueMarkSpecS.length !== 0 && valueMarkSpecA.length !== 0) {
    //         currentContainerPosition++;
    //     } 

    //     setContainerPosition(currentContainerPosition);
    // }, [
    //     valueMarkSpecS,
    //     valueMarkSpecA
    // ]);
    // useEffect(() => {
    //     let currentContainerPosition = containerPosition;

    //     if ((stampS !== '' && stampA !== '') && (stampSFirst || stampAFirst)) {
    //         currentContainerPosition++;
    //         setStampSFirst(false);
    //         setStampAFirst(false);
    //     } else if (stampS === '' && stampA === '') {
    //         currentContainerPosition--;
    //         setStampSFirst(true);
    //         setStampAFirst(true);
    //     }

    //     setContainerPosition(currentContainerPosition);
    // }, [
    //     stampS,
    //     stampA
    // ]);

    //Master Box / K.Box ganti value
    const debouncedUpdateMasterBoxInfo = useCallback(
        debounce(async (changedValues) => {
            try {
                const updateResponse = await fetch(`http://10.19.101.166:3003/updateKbox/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(changedValues)
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update information');
                }

                // Assuming you want to handle the changeModifDate function here
                changeModifDate();
            } catch (error) {
                console.error('Error updating information:', error);
            }
        }, 500),
        [id]
    );
    const previousValuesRefKbox = useRef({
        tampilan_kabo: tampilanKabo,
        sticker_standard: valueMasterBoxStickerS,
        sticker_actual: valueMasterBoxStickerA,
        mark_brand_standard: valueMasterBoxMarkBrandS,
        mark_brand_actual: valueMasterBoxMarkBrandA,
        mark_type_standard: valueMasterBoxMarkTypeS,
        mark_type_actual: valueMasterBoxMarkTypeA,
        mark_spec_standard: valueMasterBoxMarkSpecS,
        mark_spec_actual: valueMasterBoxMarkSpecA,
        intruction_manual: instructionManualSisiPendek,
        stamp: masterBoxStamp,
        isolasi: isolasi
    });
    useEffect(() => {
        if (!loading) {
            const updatedValues = {};
            const previousValues = previousValuesRefKbox.current;

            if (tampilanKabo !== previousValues.tampilan_kabo) updatedValues.tampilan_kabo = tampilanKabo;
            if (valueMasterBoxStickerS !== previousValues.sticker_standard) updatedValues.sticker_standard = valueMasterBoxStickerS;
            if (valueMasterBoxStickerA !== previousValues.sticker_actual) updatedValues.sticker_actual = valueMasterBoxStickerA;
            if (valueMasterBoxMarkBrandS !== previousValues.mark_brand_standard) updatedValues.mark_brand_standard = valueMasterBoxMarkBrandS;
            if (valueMasterBoxMarkBrandA !== previousValues.mark_brand_actual) updatedValues.mark_brand_actual = valueMasterBoxMarkBrandA;
            if (valueMasterBoxMarkTypeS !== previousValues.mark_type_standard) updatedValues.mark_type_standard = valueMasterBoxMarkTypeS;
            if (valueMasterBoxMarkTypeA !== previousValues.mark_type_actual) updatedValues.mark_type_actual = valueMasterBoxMarkTypeA;
            if (valueMasterBoxMarkSpecS !== previousValues.mark_spec_standard) updatedValues.mark_spec_standard = valueMasterBoxMarkSpecS;
            if (valueMasterBoxMarkSpecA !== previousValues.mark_spec_actual) updatedValues.mark_spec_actual = valueMasterBoxMarkSpecA;
            if (instructionManualSisiPendek !== previousValues.intruction_manual) updatedValues.intruction_manual = instructionManualSisiPendek;
            if (masterBoxStamp !== previousValues.stamp) updatedValues.stamp = masterBoxStamp;
            if (isolasi !== previousValues.isolasi) updatedValues.isolasi = isolasi;

            if (Object.keys(updatedValues).length > 0) {
                debouncedUpdateMasterBoxInfo(updatedValues);
            }

            // Update previous values reference
            previousValuesRefKbox.current = {
                tampilan_kabo: tampilanKabo,
                sticker_standard: valueMasterBoxStickerS,
                sticker_actual: valueMasterBoxStickerA,
                mark_brand_standard: valueMasterBoxMarkBrandS,
                mark_brand_actual: valueMasterBoxMarkBrandA,
                mark_type_standard: valueMasterBoxMarkTypeS,
                mark_type_actual: valueMasterBoxMarkTypeA,
                mark_spec_standard: valueMasterBoxMarkSpecS,
                mark_spec_actual: valueMasterBoxMarkSpecA,
                intruction_manual: instructionManualSisiPendek,
                stamp: masterBoxStamp,
                isolasi: isolasi
            };
        }
    }, [
        loading,
        tampilanKabo,
        valueMasterBoxStickerS,
        valueMasterBoxStickerA,
        valueMasterBoxMarkBrandS,
        valueMasterBoxMarkBrandA,
        valueMasterBoxMarkTypeS,
        valueMasterBoxMarkTypeA,
        valueMasterBoxMarkSpecS,
        valueMasterBoxMarkSpecA,
        instructionManualSisiPendek,
        masterBoxStamp,
        isolasi,
        debouncedUpdateMasterBoxInfo
    ]);
    const [tampilanKaboFirst, setTampilanKaboFirst] = useState(true);
    const [valueMasterBoxStickerSFirst, setValueMasterBoxStickerSFirst] = useState(true);
    const [valueMasterBoxStickerAFirst, setValueMasterBoxStickerAFirst] = useState(true);
    const [valueMasterBoxMarkBrandSFirst, setValueMasterBoxMarkBrandSFirst] = useState(true);
    const [valueMasterBoxMarkBrandAFirst, setValueMasterBoxMarkBrandAFirst] = useState(true);
    const [valueMasterBoxMarkTypeSFirst, setValueMasterBoxMarkTypeSFirst] = useState(true);
    const [valueMasterBoxMarkTypeAFirst, setValueMasterBoxMarkTypeAFirst] = useState(true);
    const [valueMasterBoxMarkSpecSFirst, setValueMasterBoxMarkSpecSFirst] = useState(true);
    const [valueMasterBoxMarkSpecAFirst, setValueMasterBoxMarkSpecAFirst] = useState(true);
    const [valueInstructionManualLabelFirst, setValueInstructionManualLabelFirst] = useState(true);
    const [masterBoxStampFirst, setMasterBoxStampFirst] = useState(true);
    const [isolasiFirst, setIsolasiFirst] = useState(true);
    const [instructionManualSisiPendekFirst, setInstructionManualSisiPendekFirst] = useState(true);
    useEffect(() => {
        setMasterBoxPosition((prevPosition) => {
            let newPosition = prevPosition;

            // Check tampilanKabo
            if (tampilanKabo !== '' && tampilanKaboFirst) {
                newPosition++;
                setTampilanKaboFirst(false);
            } else if (tampilanKabo === '' && !loading && !tampilanKaboFirst) {
                newPosition--;
                setTampilanKaboFirst(true);
            }

            // Check valueMasterBoxSticker
            if ((valueMasterBoxStickerS.length !== 0 && valueMasterBoxStickerA.length !== 0) && (valueMasterBoxStickerSFirst || valueMasterBoxStickerAFirst)) {
                newPosition++;
                setValueMasterBoxStickerSFirst(false);
                setValueMasterBoxStickerAFirst(false);
            } else if (valueMasterBoxStickerS.length === 0 && valueMasterBoxStickerA.length === 0 && !loading && (!valueMasterBoxStickerSFirst || !valueMasterBoxStickerAFirst)) {
                newPosition--;
                setValueMasterBoxStickerSFirst(true);
                setValueMasterBoxStickerAFirst(true);
            }

            // Check valueMasterBoxMarkBrand
            if (valueMasterBoxMarkBrandAFirst) {
                if ((valueMasterBoxMarkBrandS !== null && valueMasterBoxMarkBrandS !== '' && valueMasterBoxMarkBrandS !== undefined) &&
                    (valueMasterBoxMarkBrandA !== null && valueMasterBoxMarkBrandA !== '' && valueMasterBoxMarkBrandA !== undefined)) {
                    newPosition++;
                    setValueMasterBoxMarkBrandAFirst(false);
                } else if ((valueMasterBoxMarkBrandS === null || valueMasterBoxMarkBrandS === '' || valueMasterBoxMarkBrandS === undefined) &&
                    (valueMasterBoxMarkBrandA === null || valueMasterBoxMarkBrandA === '' || valueMasterBoxMarkBrandA === undefined) &&
                    !loading && !valueMasterBoxMarkBrandAFirst) {
                    newPosition--;
                    setValueMasterBoxMarkBrandAFirst(true);
                }
            }

            // Check valueMasterBoxMarkType
            if (valueMasterBoxMarkTypeAFirst) {
                if ((valueMasterBoxMarkTypeS !== null && valueMasterBoxMarkTypeS !== '' && valueMasterBoxMarkTypeS !== undefined) &&
                    (valueMasterBoxMarkTypeA !== null && valueMasterBoxMarkTypeA !== '' && valueMasterBoxMarkTypeA !== undefined)) {
                    newPosition++;
                    setValueMasterBoxMarkTypeAFirst(false);
                } else if ((valueMasterBoxMarkTypeS === null || valueMasterBoxMarkTypeS === '' || valueMasterBoxMarkTypeS === undefined) &&
                    (valueMasterBoxMarkTypeA === null || valueMasterBoxMarkTypeA === '' || valueMasterBoxMarkTypeA === undefined) &&
                    !loading && !valueMasterBoxMarkTypeAFirst) {
                    newPosition--;
                    setValueMasterBoxMarkTypeAFirst(true);
                }
            }

            // Check valueMasterBoxMarkSpec
            if (valueMasterBoxMarkSpecAFirst) {
                if ((valueMasterBoxMarkSpecS !== null && valueMasterBoxMarkSpecS !== '' && valueMasterBoxMarkSpecS !== undefined) &&
                    (valueMasterBoxMarkSpecA !== null && valueMasterBoxMarkSpecA !== '' && valueMasterBoxMarkSpecA !== undefined)) {
                    newPosition++;
                    setValueMasterBoxMarkSpecAFirst(false);
                } else if ((valueMasterBoxMarkSpecS === null || valueMasterBoxMarkSpecS === '' || valueMasterBoxMarkSpecS === undefined) &&
                    (valueMasterBoxMarkSpecA === null || valueMasterBoxMarkSpecA === '' || valueMasterBoxMarkSpecA === undefined) &&
                    !loading && !valueMasterBoxMarkSpecAFirst) {
                    newPosition--;
                    setValueMasterBoxMarkSpecAFirst(true);
                }
            }

            // Check instructionManualSisiPendek
            if (instructionManualSisiPendek !== '' && instructionManualSisiPendekFirst) {
                newPosition++;
                setInstructionManualSisiPendekFirst(false);
            } else if (instructionManualSisiPendek === '' && !loading && !instructionManualSisiPendekFirst) {
                newPosition--;
                setInstructionManualSisiPendekFirst(true);
            }

            // Check masterBoxStamp
            if ((masterBoxStamp.length !== 0) && (masterBoxStampFirst)) {
                newPosition++;
                setMasterBoxStampFirst(false);
            } else if (masterBoxStamp.length === 0 && !loading && (!masterBoxStampFirst)) {
                newPosition--;
                setMasterBoxStampFirst(true);
            }

            // Check isolasi
            if (isolasi !== '' && isolasiFirst) {
                newPosition++;
                setIsolasiFirst(false);
            } else if (isolasi === '' && !loading && !isolasiFirst) {
                newPosition--;
                setIsolasiFirst(true);
            }

            return newPosition;
        });
    }, [
        loading, tampilanKabo, valueMasterBoxStickerS, valueMasterBoxStickerA, valueMasterBoxMarkBrandS, valueMasterBoxMarkBrandA,
        valueMasterBoxMarkTypeS, valueMasterBoxMarkTypeA, valueMasterBoxMarkSpecS, valueMasterBoxMarkSpecA, instructionManualSisiPendek,
        masterBoxStamp, isolasi, tampilanKaboFirst, valueMasterBoxStickerSFirst, valueMasterBoxStickerAFirst, valueMasterBoxMarkBrandAFirst,
        valueMasterBoxMarkTypeAFirst, valueMasterBoxMarkSpecAFirst, instructionManualSisiPendekFirst, masterBoxStampFirst, isolasiFirst
    ]);

    //Accessories ganti value
    const debouncedUpdateAccessoriesInfo = useCallback(
        debounce(async (changedValues) => {
            try {
                const updateResponse = await fetch(`http://10.19.101.166:3003/updateAccessories/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(changedValues)
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update information');
                }

                // Assuming you want to handle the changeModifDate function here
                changeModifDate();
            } catch (error) {
                console.error('Error updating information:', error);
            }
        }, 500),
        [id]
    );
    const previousValuesRefAccessories = useRef({
        warranty_card_standard: valueWarrantyCardS,
        warranty_card_actual: valueWarrantyCardA,
        instuction_manual_standard: valueInstructionManualLabelS,
        instuction_manual_actual: valueInstructionManualLabelA,
        elbow_standard: valueElbowS,
        elbow_actual: valueElbowA
    });
    useEffect(() => {
        if (!loading) {
            const updatedValues = {};
            const previousValues = previousValuesRefAccessories.current;

            if (valueWarrantyCardS !== previousValues.warranty_card_standard) updatedValues.warranty_card_standard = valueWarrantyCardS;
            if (valueWarrantyCardA !== previousValues.warranty_card_actual) updatedValues.warranty_card_actual = valueWarrantyCardA;
            if (valueInstructionManualLabelS !== previousValues.instuction_manual_standard) updatedValues.instuction_manual_standard = valueInstructionManualLabelS;
            if (valueInstructionManualLabelA !== previousValues.instuction_manual_actual) updatedValues.instuction_manual_actual = valueInstructionManualLabelA;
            if (valueElbowS !== previousValues.elbow_standard) updatedValues.elbow_standard = valueElbowS;
            if (valueElbowA !== previousValues.elbow_actual) updatedValues.elbow_actual = valueElbowA;


            if (Object.keys(updatedValues).length > 0) {
                debouncedUpdateAccessoriesInfo(updatedValues);
            }

            // Update previous values reference
            previousValuesRefAccessories.current = {
                warranty_card_standard: valueWarrantyCardS,
                warranty_card_actual: valueWarrantyCardA,
                instuction_manual_standard: valueInstructionManualLabelS,
                instuction_manual_actual: valueInstructionManualLabelA,
                elbow_standard: valueElbowS,
                elbow_actual: valueElbowA
            };
        }
    }, [
        loading,
        valueWarrantyCardS,
        valueWarrantyCardA,
        valueInstructionManualLabelS,
        valueInstructionManualLabelA,
        valueElbowS,
        valueElbowA,
        debouncedUpdateAccessoriesInfo
    ]);


    const [valueWarrantyCardSFirst, setValueWarrantyCardSFirst] = useState(true);
    const [valueInstructionManualLabelSFirst, setValueInstructionManualLabelSFirst] = useState(true);
    const [valueElbowSFirst, setValueElbowSFirst] = useState(true);
    useEffect(() => {
        setAcessoriesPosition((prevPosition) => {
            let newPosition = prevPosition;

            // Check valueWarrantyCard
            if (valueWarrantyCardSFirst) {
                if ((valueWarrantyCardS !== null && valueWarrantyCardS !== '' && valueWarrantyCardS !== undefined) && (valueWarrantyCardA !== null && valueWarrantyCardA !== '' && valueWarrantyCardA !== undefined)) {
                    newPosition++;
                    setValueWarrantyCardSFirst(false);
                }
            }

            // Check valueInstructionManualLabel
            if (valueInstructionManualLabelSFirst) {
                if ((valueInstructionManualLabelS !== null && valueInstructionManualLabelS !== '' && valueInstructionManualLabelS !== undefined) && (valueInstructionManualLabelA !== null && valueInstructionManualLabelA !== '' && valueInstructionManualLabelA !== undefined)) {
                    newPosition++;
                    setValueInstructionManualLabelSFirst(false);
                }
            }

            // Check valueElbow
            if (valueElbowSFirst) {
                if ((valueElbowS !== null && valueElbowS !== '' && valueElbowS !== undefined) && (valueElbowA !== null && valueElbowA !== '' && valueElbowA !== undefined)) {
                    newPosition++;
                    setValueElbowSFirst(false);
                }
            }

            return newPosition;
        });
    }, [
        valueWarrantyCardS, valueWarrantyCardA, valueInstructionManualLabelS, valueInstructionManualLabelA, valueElbowS, valueElbowA,
        valueWarrantyCardSFirst, valueInstructionManualLabelSFirst, valueElbowSFirst
    ]);


    //ganti catatan
    const [catatan, setCatatan] = useState(true);
    const handleCatatan = useCallback(async () => {
        try {
            const updateResponse = await fetch(`http://10.19.101.166:3003/changeCatatan/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    catatan: catatan || null
                })
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update information');
            }
        } catch (error) {
            console.error('Error updating information:', error);
        }
    }, [catatan, id]);

    // Debounce the handleCatatan function
    const debouncedHandleCatatan = useCallback(debounce(handleCatatan, 500), [handleCatatan]);

    useEffect(() => {
        if (!loading) {
            debouncedHandleCatatan();
            changeModifDate();
        }
    }, [loading, catatan, debouncedHandleCatatan, changeModifDate]);


    //Fungsi buat tanda tanganz
    const signatureRef = useRef();
    const handleOK = (signature) => {
        sendSignature(signature);
    };
    const clearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clearSignature();
        }
    };
    const sendSignature = async (base64Signature) => {
        try {
            await fetch(`http://10.19.101.166:3003/sendSignature/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ttd_operator: base64Signature }),
            });
            ToastAndroid.showWithGravity(
                'Tanda tangan berhasil dikirim!',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
            navigation.replace('dashboard');
        } catch (error) {
            console.error('Error sending signature:', error);
            ToastAndroid.showWithGravity(
                'Error tanda tangan gagal terkirim!',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            );
        }
    };
    const shouldShowSubmitButton = () => {
        // List all the variables that need to be checked
        const requiredFields = [
            valueBrandBatteryA, itemNumber, valueCustomerA, typeBattery, noDokPCB, valueNegaraTujuanA,
            jumlahBatteryPaletS, jumlahBatteryPaletA, kondisiSusunanBattery, kondisiIkatan,
            valueTypePalletS, valueTypePalletA, tampilanPallet, valueStyrophoreKartonTriplexS,
            valueStyrophoreKartonTriplexA, inspectionTag, shipingMark, labelProduksi,
            plastikShrink, kesesuaianTag, coverTypeBatteryS, coverTypeBatteryA, valueWarnaCoverS, valueWarnaCoverA, tampilanTerminal,
            kodeProduksi, valueBrandMarkS, valueBrandMarkA, tampilanCover, kodeFinishing,
            valueStickerCoverS, valueStickerCoverA, valueTypeVentPlugS, valueTypeVentPlugA,
            valueWarnaVentPlugS, valueWarnaVentPlugA, tampilanVentPlug, indicatorElectrolite,
            valueWarnaContainerS, valueWarnaContainerA, valueMarkBrandContainerS,
            valueMarkBrandContainerA, valueMarkTypeS, valueMarkTypeA, upperLower,
            tampilanContainer, valueStickerContainerS, valueStickerContainerA, 
            tampilanKabo, valueMasterBoxStickerS,valueMasterBoxStickerA, valueMasterBoxMarkBrandS, valueMasterBoxMarkBrandA,
            valueMasterBoxMarkTypeS, valueMasterBoxMarkTypeA, valueMasterBoxMarkSpecS, instructionManualSisiPendek,
            valueMasterBoxMarkSpecA, masterBoxStamp, isolasi,
            valueInstructionManualLabelA, valueInstructionManualLabelS, valueWarrantyCardS, valueWarrantyCardA,
            valueElbowS, valueElbowA
        ];

        // Check if any of the required fields are null, empty string, or an empty array
        for (let field of requiredFields) {
            if (Array.isArray(field)) {
                if (field.length === 0) {
                    return false; // If the field is an empty array, return false
                }
            } else if (field === null || field === "") {
                return false; // If the field is null or empty string, return false
            }
        }
        return true;
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

    // Determine which dropdown's value to set based on dropdownKey
    const sameValueClick = (dropdownKey) => {
        switch (dropdownKey) {
            //Packing
            case 'typePalletA':
                setValueTypePalletA(valueTypePalletS);
                break;
            case 'styrophoreKartonTriplexA':
                setValueStyrophoreKartonTriplexA(valueStyrophoreKartonTriplexS);
                break;
            //Cover
            case 'coverTypeBatteryA':
                setCoverTypeBatteryA(coverTypeBatteryS);
                break;
            case 'warnaCoverA':
                setValueWarnaCoverA(valueWarnaCoverS);
                break;
            case 'brandMarkA':
                setValueBrandMarkA(valueBrandMarkS);
                break;
            case 'stickerCoverA':
                setValueStickerCoverA(valueStickerCoverS);
                break;
            case 'typeVentPlugA':
                setValueTypeVentPlugA(valueTypeVentPlugS);
                break;
            case 'warnaVentPlugA':
                setValueWarnaVentPlugA(valueWarnaVentPlugS);
                break;
            //Container
            case 'warnaContainerA':
                setValueWarnaContainerA(valueWarnaContainerS);
                break;
            case 'markBrandContainerA':
                setValueMarkBrandContainerA(valueMarkBrandContainerS);
                break;
            case 'markTypeA':
                setValueMarkTypeA(valueMarkTypeS);
                break;
            case 'stickerContainerA':
                setValueStickerContainerA(valueStickerContainerS);
                break;
            //Karton Box
            case 'masterBoxStickerA':
                setValueMasterBoxStickerA(valueMasterBoxStickerS);
                break;
            case 'masterBoxMarkBrandA':
                setValueMasterBoxMarkBrandA(valueMasterBoxMarkBrandS);
                break;
            case 'masterBoxMarkTypeA':
                setValueMasterBoxMarkTypeA(valueMasterBoxMarkTypeS);
                break;
            case 'masterBoxMarkSpecA':
                setValueMasterBoxMarkSpecA(valueMasterBoxMarkSpecS);
                break;
            //Accessories
            case 'warrantyCardA':
                setValueWarrantyCardA(valueWarrantyCardS);
                break;
            case 'instructionManualLabelA':
                setValueInstructionManualLabelA(valueInstructionManualLabelS);
                break;
            case 'elbowA':
                setValueElbowA(valueElbowS);
                break;
            // Add cases for other dropdowns if needed
            default:
                break;
        }
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
                    <View style={[styles.containerIsiChecksheet, { height: '80%', flex: 0, paddingBottom:200 }]}>
                        {/* Left Box */}
                        <View style={styles.leftBoxIsiChecksheet}>
                            {/* Left Box Top Section (40%) */}
                            <View style={[styles.leftBoxTopIsiChecksheet, {height : isKeyboardOpen ? '24%' : '30%' }]}>
                                <Text style={styles.topLeftBoxTextBuatChecksheet}>Detail Checksheet</Text>
                                <View style={[styles.detailChecksheetBoxTextContainer, { paddingBottom: 0 }]}>
                                    <Text style={styles.detailChecksheetBoxTextLeft}>No. WO</Text>
                                    <Text style={styles.detailChecksheetBoxTextRight}>{noWO}</Text>
                                </View>
                                <View style={[styles.detailChecksheetBoxTextContainer, { paddingBottom: 0 }]}>
                                    <Text style={styles.detailChecksheetBoxTextLeft}>Shift</Text>
                                    <Text style={styles.detailChecksheetBoxTextRight}>{shiftName}</Text>
                                </View>
                                <View style={[styles.detailChecksheetBoxTextContainer, { paddingBottom: 0, paddingTop: 0 }]}>
                                    <Text style={styles.detailChecksheetBoxTextLeft}>Tanggal Check</Text>
                                    <Text style={styles.detailChecksheetBoxTextRight}>{tglCheck}</Text>
                                </View>
                                <View style={[styles.detailChecksheetBoxTextContainer, { paddingBottom: 0 }]}>
                                    <Text style={styles.detailChecksheetBoxTextLeft}>Tanggal Delivery</Text>
                                    <Text style={styles.detailChecksheetBoxTextRight}>{tglDelivery}</Text>
                                </View>
                            </View>
                            {/* Left Box Bottom Section (60%) */}
                            <View style={styles.leftBoxBottomIsiChecksheet}>
                                <Text style={[styles.topLeftBoxTextBuatChecksheet, { paddingBottom: 10 }]}>Inspection Item</Text>
                                <SelectableItem
                                    label="Battery Information"
                                    onPress={() => setSelectedItem('Battery Information')}
                                    isSelected={selectedItem === 'Battery Information'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                    position={batteryInformationPosition}
                                />
                                <SelectableItem
                                    label="Packing"
                                    onPress={() => setSelectedItem('Packing')}
                                    isSelected={selectedItem === 'Packing'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                    position={packingPosition}
                                />
                                <SelectableItem
                                    label="Cover"
                                    onPress={() => setSelectedItem('Cover')}
                                    isSelected={selectedItem === 'Cover'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                    position={coverPosition}
                                />
                                <SelectableItem
                                    label="Container"
                                    onPress={() => setSelectedItem('Container')}
                                    isSelected={selectedItem === 'Container'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                    position={containerPosition}
                                />
                                <SelectableItem
                                    label="Master Box / K.Box"
                                    onPress={() => setSelectedItem('Master Box / K.Box')}
                                    isSelected={selectedItem === 'Master Box / K.Box'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                    position={masterBoxPosition}
                                />
                                <SelectableItem
                                    label="Accessories"
                                    onPress={() => setSelectedItem('Accessories')}
                                    isSelected={selectedItem === 'Accessories'}
                                    backgroundColor="rgba(27, 88, 176, 1)"
                                    position={accessoriesPosition}
                                />
                            </View>
                        </View>
                        {/* Right Box */}
                        <View zIndex={0} style={[styles.rightBoxIsiChecksheet, { alignSelf: 'flex-start', height: isKeyboardOpen ? 560 : 760 }]}>
                            <Text style={styles.topLeftBoxTextBuatChecksheet}>{selectedItem}</Text>
                            <ScrollView zIndex={0} style={{ flexWrap: 'nowrap' }} nestedScrollEnabled={true} scrollEnabled={selectedItem === 'Battery Information' || selectedItem === 'Cover' || selectedItem === 'Packing' || selectedItem === 'Container' || selectedItem === 'Master Box / K.Box' || selectedItem === 'Accessories'} >
                                <View style={{ flexDirection: 'row', flexWrap: 'nowrap' }}>
                                    <View zIndex={0} style={[{ flex: 4, flexWrap: 'nowrap', height: selectedItem === 'Accessories' ? 625 : selectedItem === 'Master Box / K.Box' ? 1587 : selectedItem === 'Container' ? 1200 : selectedItem === 'Battery Information' ? 720 : selectedItem === 'Cover' ? 2380 : selectedItem === 'Packing' ? 2182 : 0, transform: [{ translateY: selectedItem === 'Master Box / K.Box' ? -72 : selectedItem === 'Container' ? -72 : selectedItem === 'Battery Information' ? -34 : selectedItem === 'Cover' ? -72 : selectedItem === 'Packing' ? -72 : selectedItem === 'Accessories' ? -72 : 0 }] }]}>
                                        <StepIndicator
                                            zIndex={0}
                                            customStyles={customStyles}
                                            stepCount={stepLabelsMap[selectedItem].length}
                                            currentPosition={startIndex}
                                            labels={stepLabelsMap[selectedItem]}
                                            direction="vertical"
                                            renderLabel={({ position, stepStatus, lbl, renderCurrentPosition }) => {
                                                const labelText = stepLabelsMap[selectedItem][position];
                                                const labelStyle = startIndex === position ? { marginBottom: 0, width: 200 } : {};
                                                return (
                                                    <TouchableOpacity
                                                        zIndex={10}
                                                        style={{
                                                            padding: 10,
                                                            alignItems: 'left',
                                                            flexWrap: 'nowrap',
                                                            transform: [{ translateX: -42 }]
                                                        }}
                                                        onPress={() => handleLabelClick(position)}>
                                                        <View zIndex={0} numberOfLines={null} style={[{ marginLeft: 30, flexDirection: 'column' }]}>
                                                            <Text
                                                                zIndex={0}
                                                                numberOfLines={null}
                                                                style={[
                                                                    {
                                                                        color: position <= startIndex ? 'rgb(27, 88, 176)' : '#999999',
                                                                        overflow: 'visible',
                                                                        textOverflow: 'ellipsis',
                                                                        flexWrap: 'nowrap'
                                                                    },
                                                                    labelStyle
                                                                ]}
                                                            >
                                                                {labelText}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 14 }}>
                                        {/* isi yang di kotak kanan dari Battery Information */}
                                        {selectedItem === 'Battery Information' && (
                                            <View style={[styles.inputContainerChecksheetIsi, { position: 'relative', zIndex: 0 }]}>
                                                <View zIndex={0}>
                                                    <DropDownPicker
                                                        open={dropdowns.brandBatteryA}
                                                        zIndex={4}
                                                        value={valueBrandBatteryA}
                                                        items={itemsBrandBatteryA}
                                                        setOpen={() => setOpen('brandBatteryA')}
                                                        setValue={setValueBrandBatteryA}
                                                        setItems={setItemsBrandBatteryA}
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 24 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 24 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: 90 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                            value={itemNumber}
                                                            onFocus={() => {
                                                                setStartIndex(1);
                                                                setTextFooterTengah(itemNumber);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setItemNumber(text)}
                                                        />
                                                    </View>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: 140 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                            value={typeBattery}
                                                            onFocus={() => {
                                                                setStartIndex(2);
                                                                setTextFooterTengah(typeBattery);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setTypeBattery(text)}
                                                        />
                                                    </View>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: 186 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={noDokPCB}
                                                            onFocus={() => {
                                                                setStartIndex(3);
                                                                setTextFooterTengah(noDokPCB);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setNoDokPCB(text)}
                                                        />
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={9}
                                                        open={dropdowns.negaraTujuanA}
                                                        value={valueNegaraTujuanA}
                                                        items={itemsNegaraTujuanA}
                                                        setOpen={() => setOpen('negaraTujuanA')}
                                                        setValue={setValueNegaraTujuanA}
                                                        setItems={setItemsNegaraTujuanA}
                                                        dropDownDirection="TOP"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 240 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 240 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                    />
                                                    <DropDownPicker
                                                        zIndex={10}
                                                        open={dropdowns.customerA}
                                                        value={valueCustomerA}
                                                        items={itemsCustomerA}
                                                        setOpen={() => setOpen('customerA')}
                                                        setValue={setValueCustomerA}
                                                        setItems={setItemsCustomerA}
                                                        dropDownDirection="TOP"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 300 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 300 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                    />

                                                    {/* Buat trigger dropdown supaya mau di scroll ke deketan dengan scrollview bentrok  */}
                                                    <View zIndex={0} style={{ marginVertical: 200 }}></View>
                                                </View>
                                            </View>
                                        )}

                                        {/* isi yang di kotak kanan dari Packing */}
                                        {selectedItem === 'Packing' && (
                                            <View style={[styles.inputContainerChecksheetIsi, { position: 'relative', zIndex: 0 }]}>
                                                <View zIndex={0}>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -12 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -12 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            keyboardType="numeric"
                                                            value={jumlahBatteryPaletS}
                                                            onFocus={() => {
                                                                setStartIndex(0);
                                                                setTextFooterTengah(jumlahBatteryPaletS);
                                                                setStepSA(0);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setJumlahBatteryPaletS(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -30 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -30 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            keyboardType="numeric"
                                                            value={jumlahBatteryPaletA}
                                                            onFocus={() => {
                                                                setStartIndex(0);
                                                                setTextFooterTengah(jumlahBatteryPaletA);
                                                                setStepSA(1);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setJumlahBatteryPaletA(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -36 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -36 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][1] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={3}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -54 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -54 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={kondisiSusunanBattery}
                                                            onFocus={() => {
                                                                setStartIndex(1);
                                                                setTextFooterTengah(kondisiSusunanBattery);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setKondisiSusunanBattery(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -60 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -60 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][2] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -78 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -78 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={kondisiIkatan}
                                                            onFocus={() => {
                                                                setStartIndex(2);
                                                                setTextFooterTengah(kondisiIkatan);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setKondisiIkatan(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -81 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={10}
                                                        open={dropdowns.typePalletS}
                                                        value={valueTypePalletS}
                                                        items={itemsTypePalletS}
                                                        setOpen={() => setOpen('typePalletS')}
                                                        setValue={setValueTypePalletS}
                                                        setItems={setItemsTypePalletS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -81 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -81 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -78 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('typePalletA')} style={{ transform: [{ translateY: -78 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={9}
                                                        open={dropdowns.typePalletA}
                                                        value={valueTypePalletA}
                                                        items={itemsTypePalletA}
                                                        setOpen={() => setOpen('typePalletA')}
                                                        setValue={setValueTypePalletA}
                                                        setItems={setItemsTypePalletA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -78 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -78 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -66 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -66 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][4] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -84 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -84 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={tampilanPallet}
                                                            onFocus={() => {
                                                                setStartIndex(4);
                                                                setTextFooterTengah(tampilanPallet);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setTampilanPallet(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -87 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={10}
                                                        open={dropdowns.styrophoreKartonTriplexS}
                                                        value={valueStyrophoreKartonTriplexS}
                                                        items={itemsStyrophoreKartonTriplexS}
                                                        setOpen={() => setOpen('styrophoreKartonTriplexS')}
                                                        setValue={setValueStyrophoreKartonTriplexS}
                                                        setItems={setItemsStyrophoreKartonTriplexS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -87 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -87 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -87 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('styrophoreKartonTriplexA')} style={{ transform: [{ translateY: -87 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={1}
                                                        open={dropdowns.styrophoreKartonTriplexA}
                                                        value={valueStyrophoreKartonTriplexA}
                                                        items={itemsStyrophoreKartonTriplexA}
                                                        setOpen={() => setOpen('styrophoreKartonTriplexA')}
                                                        setValue={setValueStyrophoreKartonTriplexA}
                                                        setItems={setItemsStyrophoreKartonTriplexA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -87 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -87 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -75 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -75 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][6] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -90 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -90 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={inspectionTag}
                                                            onFocus={() => {
                                                                setStartIndex(6);
                                                                setTextFooterTengah(inspectionTag);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setInspectionTag(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -96 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -96 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][7] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -114 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -114 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={shipingMark}
                                                            onFocus={() => {
                                                                setStartIndex(7);
                                                                setTextFooterTengah(shipingMark);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setShipingMark(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -120 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -120 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][8] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -135 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -135 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={labelProduksi}
                                                            onFocus={() => {
                                                                setStartIndex(8);
                                                                setTextFooterTengah(labelProduksi);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setLabelProduksi(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -140 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -140 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][9] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -161 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -161 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={plastikShrink}
                                                            onFocus={() => {
                                                                setStartIndex(9);
                                                                setTextFooterTengah(plastikShrink);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setPlastikShrink(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -156 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -156 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][10] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -170 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -170 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={kesesuaianTag}
                                                            onFocus={() => {
                                                                setStartIndex(10);
                                                                setTextFooterTengah(kesesuaianTag);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setKesesuaianTag(text)}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {/* isi yang di kotak kanan dari Cover */}
                                        {selectedItem === 'Cover' && (
                                            <View style={[styles.inputContainerChecksheetIsi, { position: 'relative', zIndex: 0 }]}>
                                                <View zIndex={0}>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -12 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -12 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                            value={coverTypeBatteryS}
                                                        />
                                                    </View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -36 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('coverTypeBatteryA')} style={{ transform: [{ translateY: -36 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={9}
                                                        open={dropdowns.coverTypeBatteryA}
                                                        value={coverTypeBatteryA}
                                                        items={itemsCoverTypeBatteryA}
                                                        setOpen={() => setOpen('coverTypeBatteryA')}
                                                        setValue={setCoverTypeBatteryA}
                                                        setItems={setItemsCoverTypeBatteryA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -36 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -36 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -18 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={8}
                                                        open={dropdowns.warnaCoverS}
                                                        value={valueWarnaCoverS}
                                                        items={itemsWarnaCoverS}
                                                        setOpen={() => setOpen('warnaCoverS')}
                                                        setValue={setValueWarnaCoverS}
                                                        setItems={setItemsWarnaCoverS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -18 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -18 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -24 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('warnaCoverA')} style={{ transform: [{ translateY: -24 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={7}
                                                        open={dropdowns.warnaCoverA}
                                                        value={valueWarnaCoverA}
                                                        items={itemsWarnaCoverA}
                                                        setOpen={() => setOpen('warnaCoverA')}
                                                        setValue={setValueWarnaCoverA}
                                                        setItems={setItemsWarnaCoverA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -24 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -24 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -0 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -0 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][2] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={3}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -27 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -27 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={tampilanTerminal}
                                                            onFocus={() => {
                                                                setStartIndex(2);
                                                                setTextFooterTengah(tampilanTerminal);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setTampilanTerminal(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -24 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={10}
                                                        open={dropdowns.brandMarkS}
                                                        value={valueBrandMarkS}
                                                        items={itemsBrandMarkS}
                                                        setOpen={() => setOpen('brandMarkS')}
                                                        setValue={setValueBrandMarkS}
                                                        setItems={setItemsBrandMarkS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -24 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -24 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -30 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('brandMarkA')} style={{ transform: [{ translateY: -30 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={9}
                                                        open={dropdowns.brandMarkA}
                                                        value={valueBrandMarkA}
                                                        items={itemsBrandMarkA}
                                                        setOpen={() => setOpen('brandMarkA')}
                                                        setValue={setValueBrandMarkA}
                                                        setItems={setItemsBrandMarkA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -30 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -30 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -9 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -9 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][4] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -27 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -27 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={tampilanCover}
                                                            onFocus={() => {
                                                                setStartIndex(4);
                                                                setTextFooterTengah(tampilanCover);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setTampilanCover(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -33 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -33 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][5] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -51 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -51 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={kodeFinishing}
                                                            onFocus={() => {
                                                                setStartIndex(5);
                                                                setTextFooterTengah(kodeFinishing);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setKodeFinishing(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -54 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -54 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][6] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -72 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -72 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={kodeProduksi}
                                                            onFocus={() => {
                                                                setStartIndex(6);
                                                                setTextFooterTengah(kodeProduksi);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setKodeProduksi(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -78 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        open={dropdowns.stickerCoverS}
                                                        value={valueStickerCoverS}
                                                        items={itemsStickerCoverS}
                                                        setOpen={() => setOpen('stickerCoverS')}
                                                        setValue={setValueStickerCoverS}
                                                        setItems={setItemsStickerCoverS}
                                                        zIndex={10}
                                                        multiple={true}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -78 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -78 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -78 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('stickerCoverA')} style={{ transform: [{ translateY: -78 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        open={dropdowns.stickerCoverA}
                                                        value={valueStickerCoverA}
                                                        items={itemsStickerCoverA}
                                                        setOpen={() => setOpen('stickerCoverA')}
                                                        setValue={setValueStickerCoverA}
                                                        setItems={setItemsStickerCoverA}
                                                        zIndex={9}
                                                        multiple={true}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -78 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -78 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -60 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        open={dropdowns.typeVentPlugS}
                                                        value={valueTypeVentPlugS}
                                                        items={itemsTypeVentPlugS}
                                                        setOpen={() => setOpen('typeVentPlugS')}
                                                        setValue={setValueTypeVentPlugS}
                                                        setItems={setItemsTypeVentPlugS}
                                                        zIndex={8}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -60 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -60 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -66 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('typeVentPlugA')} style={{ transform: [{ translateY: -66 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        open={dropdowns.typeVentPlugA}
                                                        value={valueTypeVentPlugA}
                                                        items={itemsTypeVentPlugA}
                                                        setOpen={() => setOpen('typeVentPlugA')}
                                                        setValue={setValueTypeVentPlugA}
                                                        setItems={setItemsTypeVentPlugA}
                                                        zIndex={7}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -66 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -66 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -45 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        open={dropdowns.warnaVentPlugS}
                                                        value={valueWarnaVentPlugS}
                                                        items={itemsWarnaVentPlugS}
                                                        setOpen={() => setOpen('warnaVentPlugS')}
                                                        setValue={setValueWarnaVentPlugS}
                                                        setItems={setItemsWarnaVentPlugS}
                                                        zIndex={6}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -45 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -45 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -42 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('warnaVentPlugA')} style={{ transform: [{ translateY: -42 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        open={dropdowns.warnaVentPlugA}
                                                        value={valueWarnaVentPlugA}
                                                        items={itemsWarnaVentPlugA}
                                                        setOpen={() => setOpen('warnaVentPlugA')}
                                                        setValue={setValueWarnaVentPlugA}
                                                        setItems={setItemsWarnaVentPlugA}
                                                        zIndex={5}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -42 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -42 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -27 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -27 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][10] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -48 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -48 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={tampilanVentPlug}
                                                            onFocus={() => {
                                                                setStartIndex(10);
                                                                setTextFooterTengah(tampilanVentPlug);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setTampilanVentPlug(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -48 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -48 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][11] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -66 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -66 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={indicatorElectrolite}
                                                            onFocus={() => {
                                                                setStartIndex(11);
                                                                setTextFooterTengah(indicatorElectrolite);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setIndicatorElectrolite(text)}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {/* isi yang di kotak kanan dari Container */}
                                        {selectedItem === 'Container' && (
                                            <View style={[styles.inputContainerChecksheetIsi, { position: 'relative', zIndex: 0 }]}>
                                                <View zIndex={0}>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -12 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={10}
                                                        open={dropdowns.warnaContainerS}
                                                        value={valueWarnaContainerS}
                                                        items={itemsWarnaContainerS}
                                                        setOpen={() => setOpen('warnaContainerS')}
                                                        setValue={setValueWarnaContainerS}
                                                        setItems={setItemsWarnaContainerS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -12 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('warnaContainerA')} style={{ transform: [{ translateY: -12 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={9}
                                                        open={dropdowns.warnaContainerA}
                                                        value={valueWarnaContainerA}
                                                        items={itemsWarnaContainerA}
                                                        setOpen={() => setOpen('warnaContainerA')}
                                                        setValue={setValueWarnaContainerA}
                                                        setItems={setItemsWarnaContainerA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 3 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={8}
                                                        open={dropdowns.markBrandContainerS}
                                                        value={valueMarkBrandContainerS}
                                                        items={itemsMarkBrandContainerS}
                                                        setOpen={() => setOpen('markBrandContainerS')}
                                                        setValue={setValueMarkBrandContainerS}
                                                        setItems={setItemsMarkBrandContainerS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 3 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 3 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: 3 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('markBrandContainerA')} style={{ transform: [{ translateY: 3 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={7}
                                                        open={dropdowns.markBrandContainerA}
                                                        value={valueMarkBrandContainerA}
                                                        items={itemsMarkBrandContainerA}
                                                        setOpen={() => setOpen('markBrandContainerA')}
                                                        setValue={setValueMarkBrandContainerA}
                                                        setItems={setItemsMarkBrandContainerA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 3 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 3 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 21 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={6}
                                                        open={dropdowns.markTypeS}
                                                        value={valueMarkTypeS}
                                                        items={itemsMarkTypeS}
                                                        setOpen={() => setOpen('markTypeS')}
                                                        setValue={setValueMarkTypeS}
                                                        setItems={setItemsMarkTypeS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 21 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 21 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: 18 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('markTypeA')} style={{ transform: [{ translateY: 18 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={5}
                                                        open={dropdowns.markTypeA}
                                                        value={valueMarkTypeA}
                                                        items={itemsMarkTypeA}
                                                        setOpen={() => setOpen('markTypeA')}
                                                        setValue={setValueMarkTypeA}
                                                        setItems={setItemsMarkTypeA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 18 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 18 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 42 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: 42 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][3] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={3}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 18 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: 18 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={upperLower}
                                                            onFocus={() => {
                                                                setStartIndex(3);
                                                                setTextFooterTengah(upperLower);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setUpperLower(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 21 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: 21 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][4] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 0 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: 0 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={tampilanContainer}
                                                            onFocus={() => {
                                                                setStartIndex(4);
                                                                setTextFooterTengah(tampilanContainer);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setTampilanContainer(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -3 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={10}
                                                        open={dropdowns.stickerContainerS}
                                                        value={valueStickerContainerS}
                                                        items={itemsStickerContainerS}
                                                        setOpen={() => setOpen('stickerContainerS')}
                                                        setValue={setValueStickerContainerS}
                                                        setItems={setItemsStickerContainerS}
                                                        multiple={true}
                                                        dropDownDirection="TOP"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -3 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -3 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -12 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('stickerContainerA')} style={{ transform: [{ translateY: -12 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={0}
                                                        open={dropdowns.stickerContainerA}
                                                        value={valueStickerContainerA}
                                                        items={itemsStickerContainerA}
                                                        setOpen={() => setOpen('stickerContainerA')}
                                                        setValue={setValueStickerContainerA}
                                                        setItems={setItemsStickerContainerA}
                                                        multiple={true}
                                                        dropDownDirection="TOP"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                </View>
                                            </View>
                                        )}

                                        {/* isi yang di kotak kanan dari Master Box / K.Box */}
                                        {selectedItem === 'Master Box / K.Box' && (
                                            <View style={[styles.inputContainerChecksheetIsi, { position: 'relative', zIndex: 0 }]}>
                                                <View zIndex={0}>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -15 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: -15 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][0] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={3}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -30 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -30 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={tampilanKabo}
                                                            onFocus={() => {
                                                                setStartIndex(0);
                                                                setTextFooterTengah(tampilanKabo);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setTampilanKabo(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -36 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={10}
                                                        open={dropdowns.masterBoxStickerS}
                                                        value={valueMasterBoxStickerS}
                                                        items={itemsMasterBoxStickerS}
                                                        setOpen={() => setOpen('masterBoxStickerS')}
                                                        setValue={setValueMasterBoxStickerS}
                                                        setItems={setItemsMasterBoxStickerS}
                                                        multiple={true}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -36 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -36 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -36 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('masterBoxStickerA')} style={{ transform: [{ translateY: -36 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={9}
                                                        open={dropdowns.masterBoxStickerA}
                                                        value={valueMasterBoxStickerA}
                                                        items={itemsMasterBoxStickerA}
                                                        setOpen={() => setOpen('masterBoxStickerA')}
                                                        setValue={setValueMasterBoxStickerA}
                                                        setItems={setItemsMasterBoxStickerA}
                                                        multiple={true}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -36 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -36 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -18 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={8}
                                                        open={dropdowns.masterBoxMarkBrandS}
                                                        value={valueMasterBoxMarkBrandS}
                                                        items={itemsMasterBoxMarkBrandS}
                                                        setOpen={() => setOpen('masterBoxMarkBrandS')}
                                                        setValue={setValueMasterBoxMarkBrandS}
                                                        setItems={setItemsMasterBoxMarkBrandS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -18 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -18 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -18 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('masterBoxMarkBrandA')} style={{ transform: [{ translateY: -18 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={7}
                                                        open={dropdowns.masterBoxMarkBrandA}
                                                        value={valueMasterBoxMarkBrandA}
                                                        items={itemsMasterBoxMarkBrandA}
                                                        setOpen={() => setOpen('masterBoxMarkBrandA')}
                                                        setValue={setValueMasterBoxMarkBrandA}
                                                        setItems={setItemsMasterBoxMarkBrandA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -18 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -18 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 0 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={6}
                                                        open={dropdowns.masterBoxMarkTypeS}
                                                        value={valueMasterBoxMarkTypeS}
                                                        items={itemsMasterBoxMarkTypeS}
                                                        setOpen={() => setOpen('masterBoxMarkTypeS')}
                                                        setValue={setValueMasterBoxMarkTypeS}
                                                        setItems={setItemsMasterBoxMarkTypeS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 0 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 0 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: 0 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('masterBoxMarkTypeA')} style={{ transform: [{ translateY: 0 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={5}
                                                        open={dropdowns.masterBoxMarkTypeA}
                                                        value={valueMasterBoxMarkTypeA}
                                                        items={itemsMasterBoxMarkTypeA}
                                                        setOpen={() => setOpen('masterBoxMarkTypeA')}
                                                        setValue={setValueMasterBoxMarkTypeA}
                                                        setItems={setItemsMasterBoxMarkTypeA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 0 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 0 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 12 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={4}
                                                        open={dropdowns.masterBoxMarkSpecS}
                                                        value={valueMasterBoxMarkSpecS}
                                                        items={itemsMasterBoxMarkSpecS}
                                                        setOpen={() => setOpen('masterBoxMarkSpecS')}
                                                        setValue={setValueMasterBoxMarkSpecS}
                                                        setItems={setItemsMasterBoxMarkSpecS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 12 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 12 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: 9 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('masterBoxMarkSpecA')} style={{ transform: [{ translateY: 9 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={3}
                                                        open={dropdowns.masterBoxMarkSpecA}
                                                        value={valueMasterBoxMarkSpecA}
                                                        items={itemsMasterBoxMarkSpecA}
                                                        setOpen={() => setOpen('masterBoxMarkSpecA')}
                                                        setValue={setValueMasterBoxMarkSpecA}
                                                        setItems={setItemsMasterBoxMarkSpecA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 9 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 9 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 33 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: 33 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][5] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 15 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: 15 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={instructionManualSisiPendek}
                                                            onFocus={() => {
                                                                setStartIndex(5);
                                                                setTextFooterTengah(instructionManualSisiPendek);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setInstructionManualSisiPendek(text)}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 6 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: 6 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][6] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -12 }] }]}>Actual</Text>
                                                    <DropDownPicker
                                                        zIndex={3}
                                                        open={dropdowns.masterBoxStamp}
                                                        value={masterBoxStamp}
                                                        items={itemsMasterBoxStamp}
                                                        setOpen={() => setOpen('masterBoxStamp')}
                                                        setValue={setMasterBoxStamp}
                                                        setItems={setItemsMasterBoxStamp}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        multiple={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 0 }] }]}>Standard</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: 'rgba(162, 162, 167, 0.2)', transform: [{ translateY: 0 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            placeholder={placeHolderMap[selectedItem][7] || "-"}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={false}
                                                            zIndex={0}
                                                        />
                                                    </View>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -30 }] }]}>Actual</Text>
                                                    <View zIndex={0} style={[styles.inputContainer, { backgroundColor: '#fff', transform: [{ translateY: -30 }] }]}>
                                                        <TextInput
                                                            style={{ flex: 1, opacity: 0.8, color: 'black', pointerEvents: 'none', fontFamily: 'rubik', fontWeight: 'bold' }}
                                                            autoCapitalize="none"
                                                            placeholderTextColor="#000"
                                                            underlineColorAndroid={"transparent"}
                                                            editable={true}
                                                            zIndex={0}
                                                            value={isolasi}
                                                            onFocus={() => {
                                                                setStartIndex(7);
                                                                setTextFooterTengah(isolasi);
                                                                textInputRef.current.focus();
                                                            }}
                                                            onChangeText={(text) => setIsolasi(text)}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {/* isi yang di kotak kanan dari Accessories */}
                                        {selectedItem === 'Accessories' && (
                                            <View style={[styles.inputContainerChecksheetIsi, { position: 'relative', zIndex: 0 }]}>
                                                <View zIndex={0}>
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: -12 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={10}
                                                        open={dropdowns.warrantyCardS}
                                                        value={valueWarrantyCardS}
                                                        items={itemsWarrantyCardS}
                                                        setOpen={() => setOpen('warrantyCardS')}
                                                        setValue={setValueWarrantyCardS}
                                                        setItems={setItemsWarrantyCardS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: -12 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('warrantyCardA')} style={{ transform: [{ translateY: -12 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={9}
                                                        open={dropdowns.warrantyCardA}
                                                        value={valueWarrantyCardA}
                                                        items={itemsWarrantyCardA}
                                                        setOpen={() => setOpen('warrantyCardA')}
                                                        setValue={setValueWarrantyCardA}
                                                        setItems={setItemsWarrantyCardA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: -12 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 18 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={8}
                                                        open={dropdowns.instructionManualLabelS}
                                                        value={valueInstructionManualLabelS}
                                                        items={itemsInstructionManualLabelS}
                                                        setOpen={() => setOpen('instructionManualLabelS')}
                                                        setValue={setValueInstructionManualLabelS}
                                                        setItems={setItemsInstructionManualLabelS}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 18 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 18 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: 18 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('instructionManualLabelA')} style={{ transform: [{ translateY: 18 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={7}
                                                        open={dropdowns.instructionManualLabelA}
                                                        value={valueInstructionManualLabelA}
                                                        items={itemsInstructionManualLabelA}
                                                        setOpen={() => setOpen('instructionManualLabelA')}
                                                        setValue={setValueInstructionManualLabelA}
                                                        setItems={setItemsInstructionManualLabelA}
                                                        dropDownDirection="BOTTOM"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 18 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 18 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <Text style={[styles.standardActualtext, { transform: [{ translateY: 42 }] }]}>Standard</Text>
                                                    <DropDownPicker
                                                        zIndex={dropdowns.elbowS ? 10 : 6}
                                                        open={dropdowns.elbowS}
                                                        value={valueElbowS}
                                                        items={itemsElbowS}
                                                        setOpen={() => setOpen('elbowS')}
                                                        setValue={setValueElbowS}
                                                        setItems={setItemsElbowS}
                                                        dropDownDirection="TOP"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 42 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 42 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                        <Text style={[styles.standardActualtext, { transform: [{ translateY: 39 }] }]}>Actual</Text>
                                                        <TouchableOpacity onPress={() => sameValueClick('elbowA')} style={{ transform: [{ translateY: 39 }], backgroundColor: '#1B58B0', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                            <Image source={require('../../image/Done_round.png')} style={{ width: 16, height: 16 }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DropDownPicker
                                                        zIndex={dropdowns.elbowA ? 11 : 5}
                                                        open={dropdowns.elbowA}
                                                        value={valueElbowA}
                                                        items={itemsElbowA}
                                                        setOpen={() => setOpen('elbowA')}
                                                        setValue={setValueElbowA}
                                                        setItems={setItemsElbowA}
                                                        dropDownDirection="TOP"
                                                        placeholder="Select an option..."
                                                        style={[styles.dropDownPickerChecksheetIsi, { transform: [{ translateY: 39 }] }]}
                                                        dropDownContainerStyle={[styles.dropDownContainerChecksheetIsi, { transform: [{ translateY: 39 }] }]}
                                                        showBadgeDot={true}
                                                        searchable={true}
                                                        badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
                                                        textStyle={{ color: 'black' }}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                    {/* bottom box */}
                    <View style={[styles.bottomBoxIsiChecksheetTTD, { transform: [{ translateY: -180 }], marginBottom: 0, height: 172 }]}>
                        <Text style={styles.topTextInBottomBox}>Catatan</Text>
                        {/* Textbox kosong nullable */}
                        <TextInput
                            style={[styles.cancelTextInput, { marginLeft: 26, width: '94%', height:'65%', paddingBottom: 6 }]}
                            placeholder="Silahkan isi catatan bila diperlukan"
                            placeholderTextColor="#222222"
                            multiline={true}
                            editable={true}
                            value={catatan}
                            onPressIn={() => {
                                setOpenCatatan(true)
                            }}
                            onChangeText={(text) => setCatatan(text)}
                        />
                    </View>
                </ScrollView>

                {/* footer start */}
                <View style={{ position: 'absolute', bottom: (shouldShowSubmitButton()) ? 52 : 0, left: 0, right: 0 }}>
                    {shouldShowSubmitButton() && openCatatan === false && (
                        <TouchableOpacity onPress={submitClick} style={{
                            flexDirection: 'row',
                            backgroundColor: 'rgba(117, 173, 93, 1)',
                            width: 'auto',
                            height: '50%',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Icon name="check-circle" size={20} color="#FFFFFF" />
                            <Text style={{ color: '#FFFFFF', marginLeft: 8 }}>SUBMIT</Text>
                        </TouchableOpacity>
                    )}
                    {!openCatatan && (
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={handlePrevious} style={[styles.footerContainerBackNext]}>
                                    <Text style={[styles.footerText2, { color: 'rgba(0, 0, 0, 0.3)' }]}>
                                        <Text style={{ fontSize: 18 }}>{'<'}</Text> PREVIOUS
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 3 }}>
                                <View style={[styles.footerContainerIsiChecksheet]}>
                                    <View style={{ flex: 1, borderWidth: 0.8, borderColor: '#6666', borderRadius: 14, marginTop: 8 }}>
                                        <View style={{ justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 10 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={[styles.footerText2, { color: '#000' }]} underlineColorAndroid={"transparent"}>
                                                    {stepLabelsMap[selectedItem][startIndex] === 'Instruction Manual           (sisi pendek)' ? 'Instruction Manual (sisi pendek)' : stepLabelsMap[selectedItem][startIndex]}
                                                </Text>
                                                <Text style={[styles.footerText2, { color: 'rgba(0, 0, 0, 0.5)' }]} underlineColorAndroid="transparent">
                                                    {selectedItem === 'Packing' && startIndex === 0 ? `Std: ${jumlahBatteryPaletS}` : selectedItem === 'Cover' && startIndex === 0 ? `Std: ${coverTypeBatteryS}` : `Std: ${truncatedText}`}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <TouchableOpacity onPress={cancelClick} style={{
                                                        backgroundColor: '#E03C32', borderTopLeftRadius: 5, borderBottomLeftRadius: 5, borderTopRightRadius: 0, borderBottomRightRadius: 0, padding: 10, borderWidth: 0.8, borderColor: '#A2A2A7'
                                                    }}>
                                                        <Image source={require('../../image/Close_round.png')} style={{ width: 20, height: 20 }} />
                                                    </TouchableOpacity>
                                                    <TextInput
                                                        style={{
                                                            borderWidth: 0.8,
                                                            borderColor: '#A2A2A7',
                                                            borderRadius: 0,
                                                            paddingHorizontal: 10,
                                                            flex: 1,
                                                            marginHorizontal: 0,
                                                            fontStyle: 'normal',
                                                            fontWeight: '500',
                                                            lineHeight: 19.6,
                                                            textAlign: 'left',
                                                            fontFamily: 'Rubik',
                                                            fontSize: 13,
                                                            height: 41,
                                                            marginTop: 0,
                                                            color: '#000',
                                                            backgroundColor: '#FFFFFF'
                                                        }}
                                                        placeholderTextColor="rgba(0, 0, 0, 0.3)"
                                                        value={textFooterTengah}
                                                        keyboardType={selectedItem === 'Packing' && startIndex === 0 ? 'numeric' : 'default'}
                                                        placeholder={selectedItem === 'Packing' && stepSA === 0 ? 'Standard' : 'Actual'}
                                                        autoCapitalize="none"
                                                        inputType="text"
                                                        ref={textInputRef}
                                                        onFocus={() => {
                                                            setIsKeyboardOpen(true);
                                                            textInputRef.current.setNativeProps({
                                                                autoCapitalize: 'none'
                                                            });
                                                        }}
                                                        onBlur={() => setIsKeyboardOpen(false)}
                                                        onChangeText={(text) => setTextFooterTengah(text)}
                                                    />
                                                    <TouchableOpacity onPress={stripClick} style={{ backgroundColor: '#A2A2A7', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, padding: 10, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                        <Image source={require('../../image/u_minus.png')} style={{ width: 20, height: 20 }} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={checkClick} style={{ backgroundColor: '#1B58B0', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 5, borderBottomRightRadius: 5, padding: 10, borderWidth: 0.8, borderColor: '#A2A2A7' }}>
                                                        <Image source={require('../../image/Done_round.png')} style={{ width: 20, height: 20 }} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={handleNext} style={[styles.footerContainerBackNext]}>
                                    <Text style={[styles.footerText2, { color: '#000', fontWeight: 'bold' }]}>
                                        NEXT <Text style={{ fontSize: 18 }}>{'>'}</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
                {/* footer end */}
            </SafeAreaView>

            {/* Modal Cancel Start  */}
            <Modal
                animationType="none"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.loginmodalContainer}>
                    <View style={[styles.cancelmodalContent]}>
                        <Text style={[styles.topLeftBoxTextBuatChecksheet, { alignSelf: 'flex-start', paddingLeft: 0, paddingTop: 0, paddingBottom: 24, fontWeight: '800' }]}>Cancel Checksheet</Text>
                        <Text style={[styles.topLeftBoxTextBuatChecksheet, { alignSelf: 'flex-start', paddingLeft: 0, paddingTop: 0, paddingBottom: 10, fontWeight: 'normal', fontSize: 14 }]}>
                            Apakah Anda yakin ingin cancel checksheet ini? Checksheet tidak akan bisa diedit sesudah aksi ini
                            <Text style={{ color: '#E03C32' }}> *</Text>
                        </Text>
                        <View style={{ height: 110, width: '100%', paddingBottom: 10 }}>
                            <TextInput
                                style={{
                                    borderWidth: 0.8,
                                    borderColor: '#A2A2A7',
                                    borderRadius: 10,
                                    paddingHorizontal: 10,
                                    flex: 1,
                                    marginHorizontal: 0,
                                    fontStyle: 'normal',
                                    fontWeight: '500',
                                    lineHeight: 19.6,
                                    textAlign: 'left',
                                    fontFamily: 'Rubik',
                                    fontSize: 14,
                                    marginTop: 0,
                                    color: '#000',
                                    backgroundColor: '#FFFFFF',
                                    height: '100%',
                                    textAlignVertical: 'top',
                                    alignItems: 'flex-start'
                                }}
                                placeholderTextColor="rgba(0, 0, 0, 0.3)"
                                placeholder="Mohon mengisi alasan cancel."
                                value={inputCancel}
                                onChangeText={handleInputCancel}
                            />
                        </View>
                        <Text style={[styles.topLeftBoxTextBuatChecksheet, { alignSelf: 'flex-start', paddingLeft: 0, paddingTop: 0, paddingBottom: 10, fontWeight: 'normal', fontSize: 14 }]}>
                            Upload Lampiran Cancel
                            <Text style={{ color: '#E03C32' }}> *</Text>
                        </Text>
                        <TouchableOpacity onPress={handleUploadPress} style={{ height: 36, width: '100%', paddingBottom: 10}}>       
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text
                                    style={{
                                        borderWidth: 0.8,
                                        borderColor: '#A2A2A7',
                                        borderRadius: 10,
                                        paddingHorizontal: 10,
                                        flex: 1,
                                        marginHorizontal: 0,
                                        fontStyle: 'normal',
                                        fontWeight: '500',
                                        lineHeight: 19.6,
                                        textAlign: 'left',
                                        fontFamily: 'Rubik',
                                        fontSize: 14,
                                        marginTop: 0,
                                        color: '#000',
                                        backgroundColor: '#FFFFFF',
                                        height: 36,
                                        textAlignVertical: 'center',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    {selectedFileName ? `${selectedFileName}` : ''}
                                </Text>

                                <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: '#979797', borderRadius: 2, borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 0, paddingLeft: 16, paddingRight:16, justifyContent: 'center' }}>
                                <Text style={{ fontFamily: 'Rubik', fontSize: 14, color: '#fff', alignSelf: 'center', textAlign: 'center' }}>
                                        Browse
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop:10 }}>
                            <TouchableOpacity
                                style={[styles.buttonModalIsiChecksheet, { marginHorizontal: 10 }]}
                                onPress={closeModal}
                            >
                                <Text style={{ color: '#979797', alignSelf: 'center', textAlign: 'center' }}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.buttonModalIsiChecksheet, { backgroundColor: '#E03C32', marginHorizontal: 10 }]}
                                onPress={submitCancel}
                            >
                                <Text style={{ color: '#FFFFFF', alignSelf: 'center', textAlign: 'center' }}>Ya, cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Modal Cancel End  */}

            {/* Modal Submit Start  */}
            <Modal
                animationType="none"
                transparent={true}
                visible={isModalSubmitVisible}
                onRequestClose={closeSubmitModal}
            >
                <View style={[styles.loginmodalContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={[styles.cancelmodalContent]}>
                    {/* <View style={[styles.cancelmodalContent, { width: '80%', padding: 20 }]}> */}
                        <Text style={[styles.topLeftBoxTextBuatChecksheet, { alignSelf: 'flex-start', paddingLeft: 0, paddingTop: 0, paddingBottom: 24, fontWeight: '800' }]}>
                            Submit Checksheet
                        </Text>
                        <Text style={[styles.topLeftBoxTextBuatChecksheet, { alignSelf: 'flex-start', paddingLeft: 0, paddingTop: 0, paddingBottom: 10, fontWeight: 'normal', fontSize: 14 }]}>
                            Tanda tangan untuk submit checksheet
                        </Text>
                        <View style={{ justifyContent: 'center', alignItems: 'center', height: 200, width:"100%" }}>
                            <Signature
                                ref={signatureRef}
                                onOK={handleOK}
                                descriptionText="Sign"
                                clearText="Clear"
                                confirmText="Save"
                                webStyle={`
                                .m-signature-pad--footer {display: none; margin: 0px;}
                                .m-signature-pad {
                                position: fixed;
                                margin:auto; 
                                top: 0; 
                                width:100%;
                                height:100%
                                alignment: center;
                                }
                                body,html { 
                                position:relative; 
                                }
                            `}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <TouchableOpacity
                                style={[styles.buttonModalIsiChecksheet, { marginHorizontal: 10 }]}
                                onPress={clearSignature}
                            >
                                <Text style={{ color: '#979797', alignSelf: 'center', textAlign: 'center' }}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.buttonModalIsiChecksheet, { backgroundColor: 'rgba(113, 172, 88, 1)', marginHorizontal: 10 }]}
                                onPress={() => signatureRef.current.readSignature()}
                            >
                                <Text style={{ color: '#FFFFFF', alignSelf: 'center', textAlign: 'center' }}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Modal Submit End  */}

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
        </DrawerSceneWrapper>
    );
};

export default ChecksheetIsiKembali;