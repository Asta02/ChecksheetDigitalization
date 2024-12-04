import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import styles from '../styles';
import { useNavigation } from '@react-navigation/native';

const ChecksheetNotifListing = ({ data }) => {
    const navigation = useNavigation();

    const handleItemPress = async (item) => {
        try {
            const valuesToPass = {
                id: item.id,
                status: item.status
            };

            // Update notification status
            const response = await fetch(`http://10.19.101.166:3003/changeStatusNotif/${item.id}`, {
                method: 'PUT',
            });

            if (!response.ok) {
                throw new Error('Failed to update notification status');
            }

            // Navigate based on item.status
            if ([1, 2, 3].includes(item.status)) {
                navigation.replace('drawer', { screen: 'checksheettunggu', params: valuesToPass });
            } else if ([4, 5].includes(item.status)) {
                navigation.replace('drawer', { screen: 'checksheetcancelissue', params: valuesToPass });
            } else {
                navigation.replace('drawer', { screen: 'checksheetisikembali', params: valuesToPass });
            }
        } catch (error) {
            console.error('Error handling item press:', error);
            Alert.alert('Error', 'Failed to handle item press. Please try again later.');
        }
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const categorizedData = {
        today: [],
        yesterday: [],
        old: []
    };

    data.forEach(item => {
        const newTanggal = new Date(item.tanggal);
        newTanggal.setHours(newTanggal.getHours() - 7);
        item.formattedTanggal = newTanggal.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const isToday = newTanggal.toDateString() === today.toDateString();
        const isYesterday = newTanggal.toDateString() === yesterday.toDateString();

        if (isToday) {
            categorizedData.today.push(item);
        } else if (isYesterday) {
            categorizedData.yesterday.push(item);
        } else {
            categorizedData.old.push(item);
        }
    });

    const renderItem = ({ item }) => {
        let statusText = '';

        if ([1, 2, 3].includes(item.status)) {
            statusText = `${item.nama} telah menandatangani checksheet:`;
        } else if (item.status === 4) {
            statusText = `${item.nama} menandai masalah pada checksheet:`;
        } else if (item.status === 5) {
            statusText = `${item.nama} telah membatalkan checksheet:`;
        } else{
            statusText = `${item.nama} telah membuat checksheet:`;
        }

        return (
            <TouchableOpacity>
                <View>
                    <Text style={[styles.listDescription, { color: '#000', fontSize: 14, fontWeight: 'normal', textShadowColor: '#A9A9A9', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }]}>
                        {statusText}
                    </Text>
                    <TouchableOpacity onPress={() => handleItemPress(item)}>
                        <Text style={[styles.listNotif, { color: 'rgb(27, 88, 176)' }]}>{item.title}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.listDescription, { paddingBottom: 12, opacity: 0.4, color: '#000' }]}>{item.formattedTanggal}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSection = (category) => {
        let headerText;
        switch (category) {
            case 'today':
                headerText = 'T O D A Y';
                break;
            case 'yesterday':
                headerText = 'Y E S T E R D A Y';
                break;
            case 'old':
                headerText = 'O L D';
                break;
            default:
                headerText = category.toUpperCase();
        }

        return (
            <View>
                {categorizedData[category].length > 0 && (
                    <View>
                        <Text style={[styles.listDescription, { color: 'rgb(27, 88, 176)', opacity: 0.4 }]}>
                            {headerText}
                        </Text>
                        <FlatList
                            data={categorizedData[category]}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1, height: 0.8, backgroundColor: '#A2A2A7', marginHorizontal: 16, opacity: 0.5 }} />
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <FlatList
            data={['today', 'yesterday', 'old']}
            keyExtractor={(item) => item}
            renderItem={({ item }) => renderSection(item)}
        />
    );
};

export default ChecksheetNotifListing;
