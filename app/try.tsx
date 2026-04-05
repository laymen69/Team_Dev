/**
 * Merchandising3D — pure React Native version
 * Replaces expo-three / three (broken on web) with RN Animated.
 * Visual: dark sci-fi background + animated grid + floating product cards +
 *         shelf row + pulsing connection lines.
 */
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";
import PremiumGlowButton from "./button";

const { width: W, height: H } = Dimensions.get("window");

/* ─── Product images ─────────────────────────────────────────────────── */
const PRODUCT_IMAGES: ImageSourcePropType[] = [
  require("../assets/images/tunisia/boisson-gazeuse.png"),
  require("../assets/images/tunisia/eau-minerale.png"),
  require("../assets/images/tunisia/fromage-fondu.png"),
  require("../assets/images/tunisia/lben.jpg"),
  require("../assets/images/tunisia/lait-1-2-ecreme.png"),
  require("../assets/images/tunisia/yaourt.png"),
];

const PRODUCT_SIZE = 72; // px

/* ─── Helpers ────────────────────────────────────────────────────────── */
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/* ─── Animated grid dots background ─────────────────────────────────── */
const DOT_COLS = 12;
const DOT_ROWS = 18;
const DOT_SPACING = W / DOT_COLS;

function GridDots() {
  const anims = useRef(
    Array.from({ length: DOT_COLS * DOT_ROWS }, () => new Animated.Value(rand(0.05, 0.35)))
  ).current;

  useEffect(() => {
    anims.forEach((a, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(a, {
            toValue: rand(0.4, 0.9),
            duration: rand(1800, 3600),
            delay: rand(0, 800) + i * 12,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: rand(0.05, 0.25),
            duration: rand(1800, 3200),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((a, idx) => {
        const col = idx % DOT_COLS;
        const row = Math.floor(idx / DOT_COLS);
        return (
          <Animated.View
            key={idx}
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: "#8b5cf6",
              left: col * DOT_SPACING + DOT_SPACING / 2,
              top: row * (H / DOT_ROWS) + H / DOT_ROWS / 2,
              opacity: a,
            }}
          />
        );
      })}
    </View>
  );
}

/* ─── A single floating product card ─────────────────────────────────── */
type FloatingCardProps = {
  source: ImageSourcePropType;
  initialX: number;
  initialY: number;
  vx: number;
  vy: number;
  delay: number;
};

function FloatingCard({ source, initialX, initialY, delay }: FloatingCardProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -18,
          duration: 2600,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 1,
          duration: 5000,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: -1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.9,
          duration: 1800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const deg = rotate.interpolate({ inputRange: [-1, 1], outputRange: ["-6deg", "6deg"] });

  return (
    <Animated.View
      style={[
        styles.floatingCard,
        {
          left: initialX,
          top: initialY,
          transform: [{ translateY }, { rotate: deg }],
        },
      ]}
    >
      {/* Purple glow ring */}
      <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
      <Image source={source} style={styles.productImg} resizeMode="contain" />
    </Animated.View>
  );
}

function ShelfItem({ src, i }: { src: any; i: number }) {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -8,
          duration: 1200 + i * 150,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1200 + i * 150,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bob, i]);

  return (
    <Animated.View style={{ transform: [{ translateY: bob }] }}>
      <Image source={src} style={styles.shelfProduct} resizeMode="contain" />
    </Animated.View>
  );
}

/* ─── Shelf row (6 products lined up at the bottom) ─────────────────── */
function ShelfRow() {
  const shelf = PRODUCT_IMAGES;
  return (
    <View style={styles.shelf}>
      <View style={styles.shelfRail} />
      <View style={styles.shelfItems}>
        {shelf.map((src, i) => (
          <ShelfItem key={i} src={src} i={i} />
        ))}
      </View>
    </View>
  );
}

/* ─── Connection lines between floating cards ────────────────────────── */
type Line = { x1: number; y1: number; x2: number; y2: number; opacity: Animated.Value };

function ConnectionLines({ positions }: { positions: { x: number; y: number }[] }) {
  const lines = useRef<Line[]>(
    positions.flatMap((a, i) =>
      positions.slice(i + 1).map((b) => ({
        x1: a.x + PRODUCT_SIZE / 2,
        y1: a.y + PRODUCT_SIZE / 2,
        x2: b.x + PRODUCT_SIZE / 2,
        y2: b.y + PRODUCT_SIZE / 2,
        opacity: new Animated.Value(rand(0.1, 0.4)),
      }))
    )
  ).current;

  useEffect(() => {
    lines.forEach((l) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(l.opacity, {
            toValue: rand(0.5, 0.85),
            duration: rand(1500, 3000),
            useNativeDriver: true,
          }),
          Animated.timing(l.opacity, {
            toValue: rand(0.05, 0.25),
            duration: rand(1500, 3000),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines.map((line, i) => {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: line.x1,
              top: line.y1,
              width: length,
              height: 1.5,
              backgroundColor: "#8b5cf6",
              opacity: line.opacity,
              transformOrigin: "0 50%",
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
    </View>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function Merchandising3D() {
  // Pre-compute stable random positions for floating cards
  const floatingPositions = useRef(
    PRODUCT_IMAGES.map((_, i) => ({
      x: rand(PRODUCT_SIZE, W - PRODUCT_SIZE * 2),
      y: rand(60, H * 0.5),
      vx: rand(-0.5, 0.5),
      vy: rand(-0.3, 0.3),
      delay: i * 280,
    }))
  ).current;

  return (
    <View style={styles.container}>
      {/* Animated background grid */}
      <GridDots />

      {/* Purple ambient glow blobs */}
      <View style={[styles.blob, { top: -80, left: -60, backgroundColor: "#7c3aed" }]} />
      <View style={[styles.blob, { bottom: 120, right: -80, backgroundColor: "#a21caf", width: 260, height: 260 }]} />

      {/* Connection lines */}
      <ConnectionLines positions={floatingPositions} />

      {/* Floating product cards */}
      {PRODUCT_IMAGES.map((src, i) => (
        <FloatingCard
          key={i}
          source={src}
          initialX={floatingPositions[i].x}
          initialY={floatingPositions[i].y}
          vx={floatingPositions[i].vx}
          vy={floatingPositions[i].vy}
          delay={floatingPositions[i].delay}
        />
      ))}

      {/* Shelf at bottom */}
      <ShelfRow />

      {/* Modern CTA Button Showcase */}
      <View style={{ position: 'absolute', bottom: 180, width: '100%', alignItems: 'center' }}>
        <PremiumGlowButton
          title="Try out in new flow"
          variant="neon-white"
          onPress={() => { }}
          style={{ width: 220, height: 50 }}
        />
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0615",
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.12,
  },
  floatingCard: {
    position: "absolute",
    width: PRODUCT_SIZE,
    height: PRODUCT_SIZE * 1.3,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: PRODUCT_SIZE + 16,
    height: PRODUCT_SIZE * 1.3 + 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#a78bfa",
    backgroundColor: "rgba(139,92,246,0.08)",
  },
  productImg: {
    width: PRODUCT_SIZE - 8,
    height: PRODUCT_SIZE * 1.2,
  },

  /* Shelf */
  shelf: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
  },
  shelfRail: {
    height: 4,
    backgroundColor: "#4c1d95",
    marginHorizontal: 12,
    borderRadius: 2,
    shadowColor: "#a78bfa",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  shelfItems: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  shelfProduct: {
    width: 44,
    height: 56,
  },
});