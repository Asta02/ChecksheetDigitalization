// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Gif from 'react-native-gif';
// import styles from '../../styles';
// import DrawerSceneWrapper from '../../components/DrawerSceneWrapper';

// const SuksesMessage = ({ navigation }) => {
//     const { openDrawer } = navigation;

//     return (
//         <DrawerSceneWrapper>
//             <SafeAreaView style={styles.successMessageContainer}>
//                 <View style={styles2.wrapper}>
//                     <View style={styles2.searchBar}>
//                         <TouchableOpacity onPress={openDrawer}>
//                             <Icon name="menu" size={20} color="#666" />
//                         </TouchableOpacity>
//                         <Text style={styles2.searchTextPlaceHolder}>Search Here</Text>
//                     </View>
//                                     <Gif
//                     style={{ width: 200, height: 200 }}
//                     source={require('../../image/gif_success.gif')}
//                 />
//                 <Text style={styles.successMessagetitle}>Berhasil!</Text>
//                 <Text style={styles.successMessagetitlebottom}>
//                     Checksheet Anda berhasil disimpan.
//                 </Text>
//                 <TouchableOpacity style={styles.buttonSukses}>
//                     <Text style={{ color: '#FFFFFF', alignSelf: 'center', textAlign: 'center' }}>
//                         Kembali
//                     </Text>
//                 </TouchableOpacity>
//                 </View>
//             </SafeAreaView>
//         </DrawerSceneWrapper>
//     );
// };

// export default SuksesMessage;

// const styles2 = StyleSheet.create({
//     container: { backgroundColor: '#fff', flex: 1 },
//     wrapper: { padding: 16 },
//     searchBar: {
//         backgroundColor: '#fff',
//         borderRadius: 50,
//         padding: 16,
//         flexDirection: 'row',
//         alignItems: 'center',
//         shadowOffset: {
//             width: 0,
//             height: 5,
//         },
//         shadowColor: '#000',
//         shadowOpacity: 0.1,
//         shadowRadius: 10,
//         marginBottom: 12,
//     },
//     searchTextPlaceHolder: {
//         color: '#666',
//         marginLeft: 8,
//     },
// });

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import styles from '../../styles';
import Gif from 'react-native-gif';

const SuksesMessage = () => {
    return (
        <View style={styles.successMessageContainer}>
            <Gif
                style={{ width: 200, height: 200 }}
                source={require('../../image/gif_success.gif')}
            />
            <Text style={styles.successMessagetitle}>Berhasil!</Text>
            <Text style={styles.successMessagetitlebottom}>Checksheet Anda berhasil disimpan.</Text>
            <TouchableOpacity
                style={styles.buttonSukses}
            >
                <Text style={{ color: '#FFFFFF', alignSelf: 'center', textAlign: 'center' }}>Kembali</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SuksesMessage;

