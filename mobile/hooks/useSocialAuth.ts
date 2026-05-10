import { useSSO } from "@clerk/expo"
import { useState } from "react"
import { Alert } from "react-native"

export const useSocialAuth = () => {

    const [isLoading, setIsLoading] = useState(false)
    const { startSSOFlow } = useSSO()

    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
        setIsLoading(true)
        try {
            const { createdSessionId, setActive } = await startSSOFlow({ strategy })

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId })
            }
        } catch (err: any) {
            console.log("Error in social auth", err?.message || err)
            const provider = strategy === "oauth_google" ? "Google" : "Apple"
            Alert.alert("Error", err?.message || `Failed to sign in with ${provider}. Please try again.`)
        } finally {
            setIsLoading(false)
        }
    }

    return { isLoading, handleSocialAuth }
}