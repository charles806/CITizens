import { useSocialAuth } from "@/hooks/useSocialAuth";
import React, { useEffect, useRef } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  StatusBar,
} from "react-native";

export default function Index() {
  const { handleSocialAuth, isLoading } = useSocialAuth();

  // Main animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Blob animations
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Screen entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    // Blob 1 floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(blob1Anim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Blob 2 floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(blob2Anim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [blob1Anim, blob2Anim, fadeAnim, scaleAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Animated Background Blobs */}

      <Animated.View
        style={[
          styles.topBlob,
          {
            transform: [
              {
                translateY: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
              {
                translateX: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
              {
                scale: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.08],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.bottomBlob,
          {
            transform: [
              {
                translateY: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
              {
                translateX: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 12],
                }),
              },
              {
                scale: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              },
            ],
          },
        ]}
      />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Hero Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../assets/images/auth.png")}
            style={styles.authImage}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Your people are here </Text>

          <Text style={styles.subtitle}>
            Connect, vibe, chat, and stay close with your friends.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Google */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.socialButton}
            onPress={() => handleSocialAuth("oauth_google")}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <>
                <Image
                  source={require("../../assets/images/google.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />

                <Text style={styles.socialText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.socialButton, styles.appleButton]}
            onPress={() => handleSocialAuth("oauth_apple")}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Image
                  source={require("../../assets/images/apple.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />

                <Text style={styles.socialText}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          By signing up, you agree to our <Text style={styles.link}>Terms</Text>
          , <Text style={styles.link}>Privacy Policy</Text> and{" "}
          <Text style={styles.link}>Cookie Use</Text>.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    zIndex: 10,
  },

  // Animated blobs
  topBlob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: "#E8F0FE",
    top: -120,
    right: -90,
    opacity: 0.9,
  },

  bottomBlob: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "#FFF1E6",
    bottom: -80,
    left: -60,
    opacity: 0.8,
  },

  imageWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },

  authImage: {
    width: 280,
    height: 280,
  },

  textContainer: {
    alignItems: "center",
    marginBottom: 35,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  buttonContainer: {
    gap: 14,
  },

  socialButton: {
    height: 58,
    backgroundColor: "#fff",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,

    elevation: 3,
  },

  appleButton: {
    backgroundColor: "#FAFAFA",
  },

  socialIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },

  socialText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  footerText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 28,
    paddingHorizontal: 10,
  },

  link: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
