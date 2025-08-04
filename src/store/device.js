import axios from "axios";
import mqtt from "mqtt";
import mit from 'mitt'
import { defineStore } from "pinia";
const emitter = mit()
const cctvUrl = import.meta.env.VITE_CCTV_URL
export const useDeviceStore = defineStore('device', {
    state: () => ({
        isLoading: false,
        devices: [],
        device: {},
        cctvs: [],
        waterStat: {},
        realTimeFlowRate: null,
        instantTraffic: null,
        waterCategory: [],
        gsm: null,
        mobile: {},
        alerts: [],
        sms: [],
        LoggerData: [],
        panelSurya: {
            voltage: 0,
            current: 0,
            power: 0
        },
        battery: {
            voltage: 0,
            current: 0,
            soc: 0,
            temperature: 0
        },
        load: {
            voltage: 0,
            current: 0,
            power: 0
        },
        client: null ,
        connected: false,
        currentTopic: null
    }),

    actions: {
        async getDevice (deviceId) {
            this.isLoading = true
            this.realTimeFlowRate = null
            this.instantTraffic = null
            this.mobile = {}
            this.gsm = null
            try {
                const deviceData = await axios.get('/api/telemetry/'+deviceId)
                this.isLoading = false
                if(deviceData) {
                    this.device = deviceData.data.data
                    const typeCctv = ['ptz', 'static']
                    const ip = this.device.cctvIp
                    if(ip) {
                        this.cctvs = []
                        for(let i = 0; i < typeCctv.length; i++) {
                            this.cctvs.push({type: typeCctv[i], url: `${cctvUrl}/${ip}_${typeCctv[i]}/index.m3u8`})
                        }
                    }
                }
                const id = deviceData.data.data._id
                const waterStat = await axios.get('/api/logger/stat/'+id)
                if(waterStat) {
                    this.waterStat = waterStat.data.data[0]
                }
                const waterCategory = await axios.get('/api/threshold/'+id)
                if(waterCategory) {
                    this.waterCategory = waterCategory.data.data
                }
                const mobileUsage = await axios.get('/api/mobile-usage/'+id)
                this.mobile['yesterday'] = mobileUsage?.data?.data?.yesterday || 0
                this.mobile['total7d'] = mobileUsage?.data?.data?.total7d || 0
                this.mobile['total30d'] = mobileUsage?.data?.data?.total30d || 0

                const alerts = await axios.get('/api/alert/'+id)
                if(alerts) {
                    this.alerts = alerts.data.data
                }

                const sms = await axios.get('/api/sms/'+id)
                if(sms) {
                    this.sms = sms.data.data
                }

                const topic = ['device/'+id, 'sensor/'+id, 'status/#', 'logger/'+id, 'alert/'+id, 'sms/'+id]
                this.switchTopic(topic)
            } catch (error) {
                this.isLoading = false
            }
            

        },
        async getAllDevice () {
            this.isLoading = true
            const data = await axios.get('/api/telemetry')
            const map = data.data.data.map(item => ({
                id: item._id,
                label: item.name,
                address: item.location?.address
            }))
            this.devices = map
            this.isLoading = false
        },

        // REALTIME EMMITER DATA
        onCurretSensor (calback)  {
            emitter.on('currentSensor', calback)
        },
        onCurrentLogger (calback) {
            emitter.on('currentLogger', calback)
        },
        resetData() {
            this.panelSurya = { voltage: 0, current: 0, power: 0 }
            this.battery = { voltage: 0, current: 0, soc: 0, temperature: 0 }
            this.load = { voltage: 0, current: 0, power: 0 }
        },
        updateSolarPanel(dataArray) {
            dataArray.forEach(item => {
                switch (item.name) {
                case 'panel_surya':
                    const panel = JSON.parse(item.data)
                    this.panelSurya.voltage = panel[0] / 100
                    this.panelSurya.current = panel[1] / 100
                    this.panelSurya.power   = ((panel[3] << 16) | panel[2]) / 100
                    break

                case 'battery':
                    const battery = JSON.parse(item.data)
                    this.battery.voltage = battery[0] / 100
                    this.battery.current = ((battery[2] << 16) | battery[1]) / 100
                    break

                case 'battery_soc':
                    const soc = JSON.parse(item.data)
                    this.battery.soc = soc[0]
                    break

                case 'battery_temp':
                    const temp = JSON.parse(item.data)
                    this.battery.temperature = temp[0] / 100
                    break

                case 'load':
                    const load = JSON.parse(item.data)
                    this.load.voltage = load[0] / 100
                    this.load.current = load[1] / 100
                    this.load.power   = ((load[3] << 16) | load[2]) / 100
                    break
                }
            })
        },
        // MQTT CONNECTION
        async connect () {
            return new Promise((resolve, reject) => {
                this.client = mqtt.connect(import.meta.env.VITE_MQTT_URL, {
                    clientId: `awlr-${Date.now()}`,
                    connectTimeout: 3000,
                    reconnectPeriod: 1000
                })
                this.client.on('connect', () => {
                    this.connected = true
                    console.log('MQTT Connected'),
                    resolve(true)
                })
                this.client.on('error', (err) => {
                    console.log('MQTT Error', err)
                    reject(err)
                })
                this.client.on('close', () => {
                    this.connected = false
                    console.log('MQTT connection closed')
                })
                this.client.on('message', (topic, message) => {
                    if(topic.startsWith('sensor/')) {
                        const raw = JSON.parse(message.toString())
                        if(raw) {
                            this.waterStat['lastWaterLevel'] = parseFloat(raw?.level)
                            this.instantTraffic = parseFloat(raw?.instantTraffic)
                            this.realTimeFlowRate = parseFloat(raw?.realTimeFlowRate)
                            emitter.emit('currentSensor', raw)
                        }
                    }
                    if(topic.startsWith('device/')) {
                        const raw = JSON.parse(message.toString())
                        this.gsm = raw?.gsm
                        this.mobile['usage'] = raw?.mobile?.tx + raw?.mobile?.rx
                        console.log(raw?.solar_panel)
                        if(raw?.solar_panel) {
                            const data = raw?.solar_panel
                            this.updateSolarPanel(data)
                        }
                        // this.device['isOnline'] = true
                    }
                    if(topic.startsWith('status/')) {
                        const [, status] = topic.split('/')
                        const payload = JSON.parse(message.toString())
                        console.log('status')
                        const deviceId = payload?.clientid
                        if(this.device?._id == deviceId) {
                            if(status == 'online') {
                                this.device['isOnline'] = true
                            } else {
                                this.device['isOnline'] = false
                                this.gsm = null
                            }
                        }
                    }
                    if(topic.startsWith('logger/')) {
                        const payload = JSON.parse(message.toString())
                        emitter.emit('currentLogger', payload)
                    }
                    if(topic.startsWith('alert/')) {
                        const payload = JSON.parse(message.toString())
                        if(this.alerts.length > 60) {
                            this.alerts.pop()
                        }
                        this.alerts.unshift(payload)
                    }
                    if(topic.startsWith('sms/')) {
                        const payload = JSON.parse(message.toString())
                        if(this.sms.length > 60) {
                            this.sms.pop()
                        }
                        this.sms.unshift(payload)
                    }
                })
            })
        },
        async subscribe (topic) {
            if(this.client && this.connected) {
                return new Promise((resolve, reject) => {
                    this.client.subscribe(topic, (err, granted) => {
                        if(err) {
                           console.error(`Subscribe error: ${topic}`, err)
                           reject(err)
                        } else {
                            console.log(`Subscribed to ${topic}`, granted)
                            resolve(granted)
                        }
                    })
                })
            }
        },
        async unsubscribe(topic) {
            if (this.client && this.connected) {
                return new Promise((resolve, reject) => {
                    this.client.unsubscribe(topic, (err) => {
                        if (err) {
                            console.error(`Unsubscribe error: ${topic}`, err)
                            reject(err)
                        } else {
                            console.log(`Unsubscribed from ${topic}`)
                            resolve(true)
                        }
                    })
                })
            }
        },

        async switchTopic(newTopic)  {
            
            if(!this.client || !this.connected) {
                throw new Error('MQTT client not connected')
            }
            if(this.currentTopic) {
                await this.unsubscribe(this.currentTopic)
            }
            const solarStore = useDeviceStore()
            solarStore.resetData()
            await this.subscribe(newTopic)
            this.currentTopic = newTopic
        } 
    }
})