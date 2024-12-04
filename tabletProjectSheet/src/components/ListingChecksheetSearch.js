import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import styles from '../styles';
import { useNavigation } from '@react-navigation/native';

const ChecksheetListingItemSearch = ({ id, title, brand, type, customer, status, tanggal }) => {
    const navigation = useNavigation();
    
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
            <View style={styles.listingWrapperSearch}>
                <Text style={[styles.listTitle, { color: 'rgb(27, 88, 176)' }]}>{title}                     </Text>
                <Text style={styles.listDescription}>{brand} / {type} / {customer}</Text>
                <Text style={styles.listDescription}>Modified Date: {formattedTanggal}</Text>
                <View style={styles.draftContainer}>
                    <Text style={styles.arrow}> {'>'}</Text>
                </View>
                <View style={styles.draftContainerSearch}>
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
                </View>
            </View>
        </TouchableOpacity>
    );
};


export default ChecksheetListingItemSearch;