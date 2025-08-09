<template>
    <div class="p-3.5 flex flex-col h-full overflow-hidden">
        <div class="flex items-center justify-between mb-1">
            <div>
                <parameter-selector v-model="parameter" />
            </div>
            <div>
                <time-range  v-model="timeRange" @download="handleDownload" />
            </div>
        </div>
        <div class="h-64 w-full relative mb-1.5">
            <canvas id="main-chart"></canvas>
            <div v-show="isLoading" class="absolute bg-gray-950/85 h-full w-full top-0 flex items-center justify-center">
                <div class="text-gray-400">Mohon Tunggu...</div>
            </div>
        </div>
        <div class=" grid grid-cols-4 gap-3 mb-3">
            <div v-for="(cat, i) in store.waterCategory" :key="i" class="p-2 bg-gray-800/50 border-b-2 border-gray-700">
                <div :class="cat.color" class="text-xs font-semibold">{{ cat.name }}</div>
                <div class="flex items-center justify-between text-xs">
                    <div><span class="text-gray-400">Min</span> {{ cat?.min }}</div>
                    <div><span class="text-gray-400">Max</span> {{ cat?.max }}</div>
                </div>
            </div>
        </div>
        <div ref="tableRef" class="rounded overflow-y-scroll hover-scroll">
            <table class="w-full">
                <thead>
                    <tr>
                        <th class="text-sm py-2 bg-gray-800 text-left px-3 font-semibold sticky top-0">Tanggal</th>
                        <th class="text-sm py-2 bg-gray-800 pr-9 text-right font-semibold sticky top-0">Level air</th>
                        <th class="text-sm py-2 bg-gray-800 pr-9 text-right font-semibold sticky top-0">Kecepatan</th>
                        <th class="text-sm py-2 bg-gray-800 pr-9 text-right font-semibold sticky top-0">Debit</th>
                        <th class="text-sm py-2 bg-gray-800 px-3 text-right font-semibold sticky top-0">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    <tr v-for="(log, i) in loggers" :key="i">
                        <td class="px-3 py-1.5 text-xs font-mono">{{ formatDate(log?.timestamp, 'table') }}</td>
                        <td class="px-3 py-1.5 text-xs font-mono text-right">
                            {{ log?.level?.toFixed(2) }} mdpl
                            <i v-if="log?.level > getPrev(i, 'level')" class="ph ph-caret-up text-red-500 ml-1"></i>
                            <i v-else-if="log?.level < getPrev(i, 'level')" class="ph ph-caret-down text-green-500 ml-1"></i>
                            <i v-else class="ph ph-caret-up-down text-gray-400 ml-1"></i>
                        </td>
                        <td class="px-3 py-1.5 text-xs font-mono text-right">
                            {{ log?.realTimeFlowRate?.toFixed(2) }} m/s
                            <i v-if="log?.realTimeFlowRate > getPrev(i, 'realTimeFlowRate')" class="ph ph-caret-up text-red-500 ml-1"></i>
                            <i v-else-if="log?.realTimeFlowRate < getPrev(i, 'realTimeFlowRate')" class="ph ph-caret-down text-green-500 ml-1"></i>
                            <i v-else class="ph ph-caret-up-down text-gray-400 ml-1"></i>
                        </td>
                        <td class="px-3 py-1.5 text-xs font-mono text-right">
                            {{ log?.instantTraffic?.toFixed(2)}} m³/s
                            <i v-if="log?.instantTraffic > getPrev(i, 'instantTraffic')" class="ph ph-caret-up text-red-500 ml-1"></i>
                            <i v-else-if="log?.instantTraffic < getPrev(i, 'instantTraffic')" class="ph ph-caret-down text-green-500 ml-1"></i>
                            <i v-else class="ph ph-caret-up-down text-gray-400 ml-1"></i>
                        </td>
                        <td class="px-3 py-1.5 text-xs font-mono text-right" :class="{'text-green-500': log?.status == 'AMAN', 'text-blue-500': log?.status == 'WASPADA', 'text-yellow-500': log?.status == 'SIAGA', 'text-red-500': log?.status == 'AWAS'}">{{ log?.status }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import ParameterSelector from './ParameterSelector.vue';
import TimeRange from './TimeRange.vue';
import Chart from 'chart.js/auto';
import { useDeviceStore } from '../store/device';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/id'
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver';

    const tableRef = ref(null)
    dayjs.locale('id')
    const store = useDeviceStore()
    let mainChart = null
    const deviceId = ref(null)
    const tooltipLine = {
        id: 'tooltipLine',
        beforeDraw: chart => {
            if(chart.tooltip._active && chart.tooltip._active.length) {
                const ctx = chart.ctx
                ctx.save()
                const activePoint = chart.tooltip._active[0]
                ctx.beginPath()
                
                ctx.moveTo(activePoint.element.x, chart.chartArea.top)
                ctx.lineTo(activePoint.element.x, chart.chartArea.bottom)
                ctx.lineWidth = 0.7
                ctx.setLineDash([5,3])
                ctx.strokeStyle = '#9ca3af'
                ctx.stroke()
                ctx.restore()
            }
        }
    }

    const lastValueLabelPlugin = {
        id: 'lastValueLabel',
        beforeInit(chart) {
            chart._currentY = null;
            chart._targetY = null;
        },
        afterDatasetsDraw(chart) {
            const dataset = chart.data.datasets[0].data;
            const yScale = chart.scales.y;

            if (!dataset.length) return;

            const rawValue = dataset[dataset.length - 1];
            const lastValue = Number(rawValue);
            const targetY = yScale.getPixelForValue(lastValue);

            // Inisialisasi
            if (chart._currentY === null) {
                chart._currentY = targetY;
            }

            // Interpolasi smooth
            const lerp = (start, end, amt) => start + (end - start) * amt;
            chart._currentY = lerp(chart._currentY, targetY, 0.005);

            const { ctx, chartArea: { right } } = chart;
            const y = chart._currentY;

            // Gambar label
            const label = lastValue.toFixed(2);
            const padding = 5;
            const labelHeight = 18;
            const textWidth = ctx.measureText(label).width;
            const boxWidth = textWidth + padding * 2;
            const boxX = right + 6;

            ctx.save();
            ctx.font = 'bold 11px sans-serif';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = 'oklch(70.5% 0.213 47.604)';
            ctx.fillRect(boxX, y - labelHeight / 2, boxWidth, labelHeight);
            ctx.fillStyle = '#fff';
            ctx.fillText(label, boxX + padding, y);
            ctx.restore();

            // Trigger animasi jika belum sampai target
            if (Math.abs(chart._currentY - targetY) > 0.5) {
            requestAnimationFrame(() => {
                chart.draw();
            });
            }
        }
    };
    onMounted(() => {
        const ctxMain = document.getElementById('main-chart')
        mainChart = new Chart(ctxMain, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        data: [],
                        borderWidth: 1,
                        borderColor: 'rgb(248, 116, 24)',
                        backgroundColor: 'rgb(248, 116, 24, 0.2)',
                        fill: true,
                        pointStyle: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Ketinggian Air (mdpl)',
                            font: {
                                size: 10
                            }
                        },
                        position: 'right',
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: 'rgb(105, 115, 131)'
                        },
                        border: {
                            color: 'rgb(29, 41, 57)'
                        },
                        grid: {
                            color: 'rgb(29, 41, 57)',
                            display: true
                        }
                    },
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 6,
                            callback: function(value, index, ticks) {
                                if(index < 1 ) return ''
                                return this.getLabelForValue(value) // tampilkan label aslinya
                            },
                            color: 'rgb(105, 115, 131)',
                            display: true,
                            font: {
                                size: 11
                            },
                        
                        }
                    }
                }
            },
            plugins: [tooltipLine, lastValueLabelPlugin],
        })
        store.onCurretSensor(realTimeChart)
        store.onCurrentLogger(realTimeLogger)
    })
    
    const loggers = ref([])
    const timeRange = ref('real')
    const parameter = ref('level')
    const isLoading = ref(false)
    const groupChart = new Map()

    const getData = (range = 'real') => {
        isLoading.value = true
        const time = range  == 'real' ? '1D':range
        axios.get('/api/logger/'+deviceId.value, {
            params: {
                range: time
            }
        })
        .then(res => {
            loggers.value = res.data.data
            updateChart(time)
        })
        .catch(err => {
            console.log(err)
        })
        .finally(() => {
            isLoading.value = false
        })
    }

    const getPrev = (index, field) => {
        if (index === loggers.value.length - 1) return loggers.value[index][field]
        return loggers.value[index + 1][field]
    }

    watch(()=> store.device, (val) => {
        if(Object.keys(val).length > 0) {
            deviceId.value = val?._id
            timeRange.value = 'real'
            parameter.value = 'level'
            if(mainChart) {
                mainChart.data.labels = []
                mainChart.data.datasets[0].data = []
                mainChart.update()
            }
            
            groupChart.clear()
            getData()
        }
    }, {immediate: true})
    const getParameterLabel = () => {
        switch (parameter.value) {
            case 'level': return 'Ketinggian Air (mdpl)'
            case 'kecepatan': return 'Kecepatan Air (m/s)'
            case 'volume': return 'Debit Air (m³/s)'
            default: return ''
        }
    }
    watch(() => parameter.value, (val) => {
        if(val == 'level') {
            mainChart.data.datasets[0].borderColor = 'rgb(248, 116, 24)'
            mainChart.data.datasets[0].backgroundColor = 'rgb(248, 116, 24, 0.2)'
        }
        if(val == 'kecepatan') {
            mainChart.data.datasets[0].borderColor = 'rgb(0, 166, 246)'
            mainChart.data.datasets[0].backgroundColor = 'rgb(0, 166, 246, 0.2)'
        }
        if(val == 'volume') {
            mainChart.data.datasets[0].borderColor = 'rgb(0, 187, 166)'
            mainChart.data.datasets[0].backgroundColor = 'rgb(0, 187, 166, 0.2)'
        }
        mainChart.options.scales.y.title.text = getParameterLabel()

        mainChart.update()
        updateChart()
        if(timeRange.value == 'real') {
            realTimeChart()
        }
    })
    watch(()=> timeRange.value, (val) => {
        getData(timeRange.value)
        if(val == 'real') {
            realTimeChart()
        }
    })
    

    const updateChart = (range) => {
        if(timeRange.value !== 'real') {
            mainChart.data.labels = []
            mainChart.data.datasets[0].data = []
            mainChart.update()
            const rawData = loggers.value
            let labelChart, dataChart 
            labelChart = rawData.map(item => formatDate(item.timestamp, range)).reverse()
            if(parameter.value == 'level') {
                dataChart = rawData.map(item => item.level).reverse()
            } else if(parameter.value == 'kecepatan') {
                dataChart = rawData.map(item => item.realTimeFlowRate).reverse()
            } else if (parameter.value == 'volume') {
                dataChart = rawData.map(item => item.instantTraffic).reverse()
            }
            mainChart.data.labels = labelChart
            mainChart.data.datasets[0].data = dataChart
            mainChart.update()
        }
    }
    
    const realTimeChart = (val) => {
        if(val) {
            for(const [key, value] of Object.entries(val)) {
                if(!groupChart.has(key)) {
                    groupChart.set(key, [])
                }
                const raw = groupChart.get(key)
                if(raw.length > 100 ) raw.shift()
                raw.push(value)
            }
        }
        if(timeRange.value == 'real' && groupChart && groupChart.size > 0) {
            if(parameter.value == 'level') {
                mainChart.data.labels = groupChart.get('timestamp').map(item => formatDate(item, 'real')) || []
                mainChart.data.datasets[0].data = groupChart.get('level') || []
            }
            if(parameter.value == 'kecepatan') {
                mainChart.data.labels = groupChart.get('timestamp').map(item => formatDate(item, 'real')) || []
                mainChart.data.datasets[0].data = groupChart.get('realTimeFlowRate') || []
            }
            if(parameter.value == 'volume') {
                mainChart.data.labels = groupChart.get('timestamp').map(item => formatDate(item, 'real')) || []
                mainChart.data.datasets[0].data = groupChart.get('instantTraffic') || []
            }
            mainChart.update()
        }
    }   
    
    const realTimeLogger = (val) => {
        loggers.value.pop()
        loggers.value.unshift(val)
        const timestamp = formatDate(val?.timestamp, timeRange.value)
        if(timeRange.value !== 'real') {
            if(parameter.value == 'level') {
                const level = val?.level
                mainChart.data.labels.shift()
                mainChart.data.datasets[0].data.shift()
                mainChart.data.labels.push(timestamp)
                mainChart.data.datasets[0].data.push(level)
            }
            if(parameter.value == 'kecepatan') {
                const realTimeFlowRate = val?.realTimeFlowRate
                mainChart.data.labels.shift()
                mainChart.data.datasets[0].data.shift()
                mainChart.data.labels.push(timestamp)
                mainChart.data.datasets[0].data.push(realTimeFlowRate)
            }
            if(parameter.value == 'volume') {
                const instantTraffic = val?.instantTraffic
                mainChart.data.labels.shift()
                mainChart.data.datasets[0].data.shift()
                mainChart.data.labels.push(timestamp)
                mainChart.data.datasets[0].data.push(instantTraffic)
            }
            mainChart.update()
        }
        tableRef.value.scrollTo({top: 0, behavior: 'smooth'})
    }

    const formatDate = (t, mode) => {
        if(mode === 'table') {
            return dayjs(t).format('DD/MMM/YYYY HH:mm')
        } else if(mode == '1D' || mode == '7D') {
            return dayjs(t).format('D HH:mm')
        } else if(mode == '1B' || mode == '3B') {
            return dayjs(t).format('D MM HH:mm')
        } else if (mode == 'real') {
            return dayjs(t).format('HH:mm:ss')
        } else {
            return dayjs(t).format('D MM YYYY HH:mm')
        }
    }

    const handleDownload = (type) => {
        if(type == 'grafik') {
            // Ambil gambar chart dari canvas Chart.js
            const chartImage = mainChart.toBase64Image()

            // buat PDF landscape A4
            const pdf = new jsPDF('l', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()

            // === Tambah site ===
            const site = store.device?.name
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            // posisi di tengah halaman
            const siteWidth = pdf.getTextWidth(site)
            pdf.text(site, (pageWidth - siteWidth) / 2, 15)

            // === Tambahkan Judul ===
            let title
            if(parameter.value == 'level') {
                title = 'Laporan Ketinggian Air (mdpl)'
            } else if (parameter.value == 'kecepatan') {
                title = 'Laporan Kecepatan Air (m/s)'
            } else if (parameter.value == 'volume') {
                title = 'Laporan Debit Air (m³/s)'
            }
            if(timeRange.value == 'real') {
                title += ' Waktu nyata'
            }
            if(timeRange.value == '1D') {
                title += ' 1 Hari terakhir'
            }
            if(timeRange.value == '7D') {
                title += ' 7 Hari terakhir'
            }
            if(timeRange.value == '1B') {
                title += ' 1 Bulan terakhir'
            }
            if(timeRange.value == '3B') {
                title += ' 3 Bulan terakhir'
            }
            if(timeRange.value == '1T') {
                title += ' 1 Tahuh terakhir'
            }
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            // posisi di tengah halaman
            const textWidth = pdf.getTextWidth(title)
            pdf.text(title, (pageWidth - textWidth) / 2, 21)

            // === Tanggal Unduh ===
            const downloadDate = 'Tanggal Unduh: '+ dayjs().format('DD MMMM YYYY HH:mm')
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'normal')
            const dateWidth = pdf.getTextWidth(downloadDate)
            pdf.text(downloadDate, (pageWidth - dateWidth) / 2, 26)

            // === Tambahkan Chart ===
            const pageHeight = pdf.internal.pageSize.getHeight()
            pdf.addImage(chartImage, 'PNG', 10, 35, pageWidth - 20, pageHeight - 100)

            // simpan
            pdf.save(`chart-${site}-${Date.now()}.pdf`)
        }
        if (type == 'data') {
            const downloadDate = new Date().toLocaleString()
            const title = `Laporan Data Logger - ${store.device?.name}`

            // 1. Buat header dan tanggal unduh (array of array)
            const aoa = [
                [title], // baris 1: judul
                [`Tanggal Unduh: ${downloadDate}`], // baris 2: tanggal unduh
                [], // baris 3 kosong
                ['Tanggal', 'Level Air (mdpl)', 'Kecepatan (m/s)', 'Debit (m³/s)', 'Status'] // baris 4: header tabel
            ]

            // 2. Tambahkan data
            loggers.value.forEach(item => {
                aoa.push([
                    formatDate(item.timestamp, 'table'),
                    item.level,
                    item.realTimeFlowRate,
                    item.instantTraffic,
                    item.status
                ])
            })

            // 3. Buat worksheet dari AOA
            const worksheet = XLSX.utils.aoa_to_sheet(aoa)

            // 4. Atur lebar kolom
            worksheet['!cols'] = [
                { wch: 25 },
                { wch: 18 },
                { wch: 20 },
                { wch: 18 },
                { wch: 12 }
            ]

            // 5. Buat workbook
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

            // 6. Convert ke buffer & simpan
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
            saveAs(blob, `data-${store.device?.name}-${Date.now()}.xlsx`)
        }
    }

</script>

