import CarouselImage1 from '@/assets/carousel/carousel1.png';
import CarouselImage2 from '@/assets/carousel/carousel2.png';
import CarouselImage3 from '@/assets/carousel/carousel3.png';
import { router } from "expo-router";
import { useRef } from "react";
import { ImageBackground, ImageURISource, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const data = [
  { id: 1, title: "Invierte #EnFacil", image: CarouselImage1, backgroundColor: '#09E5AD' },
  { id: 2, title: "Tu plata esta segura", image: CarouselImage2, backgroundColor: '#9071FF' },
  { id: 3, title: "Partamos?", image: CarouselImage3, backgroundColor: '#09E5AD' },
];
export default function CarouselLayout() {
  const carouselRef = useRef<ICarouselInstance>(null);
  const { width } = useWindowDimensions();
  return (
      <View style={{height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Carousel ref={carouselRef} 
        width={width}
        height={600}
        data={data}
        loop={false}
        renderItem={({ item }) => (
            <>
            <View style={[styles.carouselContainer, { backgroundColor: item.backgroundColor }]}>
                <ImageBackground resizeMode="contain" style={styles.carouselImage} source={item.image as ImageURISource}/>
            </View>
            <View>
                <Text style={{color: '#FF0000', fontSize: 16}}>{item.title}</Text>
            </View>
            </>

        )}
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/clickers')}
        >
          <Text style={styles.buttonText}>Go to Clickers</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    height: 300,
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});