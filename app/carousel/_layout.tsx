import CarouselImage1 from '@/assets/carousel/carousel1.png';
import CarouselImage2 from '@/assets/carousel/carousel2.png';
import CarouselImage3 from '@/assets/carousel/carousel3.png';
import { router } from "expo-router";
import { useRef, useState } from "react";
import { ImageBackground, ImageURISource, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const data = [
  { id: 1, title: "Invierte #EnFácil", subtitle: "Compra y vende más de 12.000 acciones y ETFs, solo con un par de clics.", image: CarouselImage1, backgroundColor: '#09E5AD' },
  { id: 2, title: "Tu plata está segura", subtitle: "Los brokers a través de los cuales operamos están regulados tanto en Chile (CMF) como en Estados Unidos (FINRA). Tus acciones están aseguradas por hasta US$500.000 por el SIPC.", image: CarouselImage2, backgroundColor: '#9071FF' },
  { id: 3, title: "¿Partamos?", subtitle: "Invierte desde 1 dólar, rápido y fácil. Nosotros te acompañamos en cada paso del proceso.", image: CarouselImage3, backgroundColor: '#09E5AD' },
];

export default function CarouselLayout() {
  const carouselRef = useRef<ICarouselInstance>(null);
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
      <View style={{height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Carousel ref={carouselRef} 
        width={width}
        height={600}
        data={data}
        loop={false}
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({ item }) => (
            <>
            <View style={[styles.carouselContainer, { backgroundColor: item.backgroundColor }]}>
                <ImageBackground resizeMode="contain" style={styles.carouselImage} source={item.image as ImageURISource}/>
            </View>
            <View style={{padding: 20, gap: 18, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#000000', fontSize: 22, fontWeight: 'bold', fontFamily: 'DINPro-Bold'}}>{item.title}</Text>
                <Text style={{color: '#000000', fontSize: 16, fontFamily: 'DINPro'}}>{item.subtitle}</Text>
            </View>
            </>
        )}
        />
        <View style={styles.dotContainer}>
          {data.map((_, dotIndex) => (
            <View key={dotIndex} style={[styles.dot, currentIndex === dotIndex ? styles.activeDot : styles.inactiveDot]}/>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/clickers')}
        >
          <Text style={styles.buttonText}>Ver precios</Text>
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
    fontFamily: 'DINPro-Medium',
  },
  dotContainer: {
    position: 'absolute',
    top: '35%',
    right: '42%',
    flexDirection: 'row',
    justifyContent: 'center',
   paddingVertical: 10,
  },
  dot: {
  
    height: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: 'white',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'gray',
  },
});