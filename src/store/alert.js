import { defineStore } from "pinia";
import { ref } from "vue";

export const useAlertStore = defineStore('alert', () => {
    const alerts = ref([])

    function newAlert ({message, type="success", duration = 3500}) {
        const id = Date.now()
        const alert = {id, message, type }

        alert.timerId = setTimeout(() => {
            removeAlert(id)
        }, duration)

        alerts.value.push(alert)
    }

    function removeAlert(id) {
        const alertIndex = alerts.value.findIndex((el) => el.id == id)

        if(alertIndex !== -1) {
            const [alert] = alerts.value.splice(alertIndex, 1)
        }

        if(alert.timerId) {
            clearTimeout(alert.timerId)
        }
    }

    return {
        alerts,
        newAlert,
        removeAlert
    }
})