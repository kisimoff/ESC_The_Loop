import React, {useState, useEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {globalStyles} from '../globalStyles';
import {StyleSheet, View, FlatList, Text} from 'react-native';
import ModalEdit from '../components/ModalEdit';
import Title from '../components/TitleElement';
import Esc from '../components/EscElement';
import Task from '../components/TaskElement';
import NoDataFound from '../components/NoDataFound';

export function Tasks() {
  const [data, setData] = useState<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalObject, setModalObject] = useState({});

  async function updateMyObject(updatedData: any) {
    try {
      await AsyncStorage.setItem('@Task', JSON.stringify(updatedData));
    } catch (e) {
      console.log('Error: ', e);
    }
  }
  const handleSave = async (itemUpdated: object, timestampOld: string) => {
    const findIndex = data.findIndex(
      (obj: any) => obj.timestamp === timestampOld,
    );
    if (findIndex !== -1) {
      data.splice(findIndex, 1); // Remove the object at the found index
      data.push(itemUpdated); // Append the new object to the end of the array
    }
    await updateMyObject(data);
    setModalVisible(false);
  };

  const handleDelete = async (timestamp: string) => {
    const findIndex = data.findIndex((obj: any) => obj.timestamp === timestamp);
    if (findIndex !== -1) {
      data.splice(findIndex, 1); // Remove the object at the found index
    }
    await updateMyObject(data);
    fetchData();
  };

  const handleComplete = async (timestamp: string, complete: boolean) => {
    const findIndex = data.findIndex((obj: any) => obj.timestamp === timestamp);
    if (findIndex !== -1) {
      data[findIndex].complete = !complete;
    }
    await updateMyObject(data);
  };

  async function getMyObject() {
    try {
      const jsonValue = await AsyncStorage.getItem('@Task');
      return jsonValue != null ? await JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log(' Error: ', e);
    }
    console.log('Data Loaded.');
  }

  let isActive = true;

  const fetchData = async () => {
    try {
      const data = await getMyObject();
      console.log('gettttin data', data);
      if (isActive) {
        setData(data);
        console.log('Data Loaded.', data);
      }
    } catch (e) {
      console.log('Error fetchData:', e);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      fetchData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <View style={[globalStyles.root]}>
      <View style={[globalStyles.header]}>
        <View style={[globalStyles.headerChildren]}>
          <Esc onPress={() => console.log('Esc')} />
          <Title text={'Tasks'} fontFamily={'Lexend-Medium'} fontSize={40} />
        </View>
      </View>

      <View style={styles.Tasks}>
        {!data === undefined || data == null || data.length === 0 ? (
          <NoDataFound
            boldText="No Tasks Found"
            boldTextSize={20}
            text="Add a task by pressing the + button"
          />
        ) : (
          <FlatList
            contentContainerStyle={{paddingTop: 15, gap: 5}}
            data={data}
            keyExtractor={item => item.timestamp}
            renderItem={({item}) => (
              // <View style={styles.FlatListElement}>
              <Task
                //title={item.title}
                onOpenModal={() => {
                  setModalObject(item);
                  setModalVisible(true);
                }}
                item={item}
                modalVisible={modalVisible}
                //description={item.description}
                onPressTask={() => console.log('')}
                onPressTick={handleComplete}
                onPressDelete={handleDelete}
              />
              // </View>
            )}
          />
        )}
        {/* </View> */}
        <ModalEdit
          autofocusDescription={false}
          autofocusTitle={true}
          setVisible={setModalVisible}
          visible={modalVisible}
          item={modalObject}
          onSave={handleSave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Tasks: {
    flex: 1,
    width: '100%',
  },
});
