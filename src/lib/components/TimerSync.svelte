<script lang="ts">
    import { db } from "$lib/firebase";
    import { doc, setDoc } from "firebase/firestore";
    import { timerStore } from "$lib/stores/timerStore";
    import { userStore } from "$lib/auth/userStore";

    let lastStateStr = "";

    $: if ($userStore.user) {
        smartSync($userStore.user.uid, $timerStore);
    }

    async function smartSync(uid: string, state: any) {
        // Create a signature to detect real changes (Start/Stop, Mode change)
        // We do NOT want to sync on every tick of 'timeLeft' if running
        // But we DO want to sync if paused timeLeft changes (e.g. reset)

        const meaningfulState = {
            isRunning: state.isRunning,
            mode: state.mode,
            duration: state.duration,
            // If running, we don't care about ticking timeLeft here, we calculate stats separately
            // If paused, timeLeft allows syncing the exact paused time
            timeLeft: state.isRunning ? "running" : state.timeLeft,
        };

        const currentStr = JSON.stringify(meaningfulState);
        if (currentStr === lastStateStr) return;
        lastStateStr = currentStr;

        try {
            const ref = doc(db, "nowPlaying", uid);

            // Payload
            const payload: any = {
                timer: {
                    mode: state.mode,
                    duration: state.duration,
                    isRunning: state.isRunning,
                    updatedAt: Date.now(),
                },
            };

            // If running, define target end time
            if (state.isRunning) {
                payload.timer.targetEndTime =
                    Date.now() + state.timeLeft * 1000;
            } else {
                payload.timer.timeLeft = state.timeLeft;
                payload.timer.targetEndTime = null;
            }

            await setDoc(ref, payload, { merge: true });
        } catch (e) {
            console.error("Timer Sync Error", e);
        }
    }
</script>
