import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler'; // Ensure this is needed
import { useNavigation } from '@react-navigation/native';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SortedChecksheetListingDetail = ({ id, title, brand, type, customer, status, tanggal }) => {
    const navigation = useNavigation();
    const [transformedData, setTransformedData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const npk = await AsyncStorage.getItem('userNPK');
                const response = await fetch(`http://10.19.101.166:3003/getChecksheet/${npk}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const checksheetData = await response.json();
                const transformedData = checksheetData.map(item => ({
                    id: item.id_checksheettransaction,
                    shift: item.shift,
                    kode: item.kode_checksheet,
                    title: item.nama_form,
                    brand: item.brand_battery,
                    type: item.type_battery,
                    customer: item.customer,
                    status: item.checksheetTransaction_status,
                    tanggal: item.checksheet_modifDate ? new Date(item.checksheet_modifDate).toISOString() : null,
                }));
                setTransformedData(transformedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleItemPress = (item) => {
        const valuesToPass = {
            id: item.id,
            status: item.status
        };
        if ([1, 2, 3].includes(item.status)) {
            navigation.replace('drawer', { screen: 'checksheettunggu', params: valuesToPass });
        } else if ([4, 5].includes(item.status)) {
            navigation.replace('drawer', { screen: 'checksheetcancelissue', params: valuesToPass });
        } else {
            navigation.replace('drawer', { screen: 'checksheetisikembali', params: valuesToPass });
        }
    };

    const newTanggal = new Date(tanggal);
    newTanggal.setHours(newTanggal.getHours() - 7);
    const formattedTanggal = newTanggal.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <TouchableOpacity onPress={() => handleItemPress({ id, title, brand, type, customer, status, tanggal })}>
            <View style={styles.listingWrapper}>
                <Text style={[styles.listTitle, { color: 'rgb(118, 155, 208)' }]}>
                    F2.1-K.090 <Text style={{ color: 'rgb(27, 88, 176)' }}>{title}</Text>
                </Text>
                <Text style={styles.listDescription}>{brand} / {type} / {customer}</Text>
                <Text style={styles.listDescription}>Modified Date: {formattedTanggal}</Text>
                <View style={styles.draftContainer}>
                    <Text style={[
                        styles.draftText,
                        status === 0 ? styles.bgSecondary :
                            status === 1 ? styles.bgPrimary :
                                status === 2 ? styles.bgInfo :
                                    status === 3 ? styles.bgSuccess :
                                        status === 4 ? styles.bgWarning :
                                            status === 5 ? styles.bgDanger : null
                    ]}>
                        {status === 0 ? " Draft " :
                            status === 1 ? " Menunggu TTD Leader " :
                                status === 2 ? " Menunggu TTD Kasubsie " :
                                    status === 3 ? " Selesai " :
                                        status === 4 ? " Selesai dengan Issue " :
                                            status === 5 ? " Cancelled " : ""}
                    </Text>
                    <Text style={styles.arrow}> {'>'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default SortedChecksheetListingDetail;