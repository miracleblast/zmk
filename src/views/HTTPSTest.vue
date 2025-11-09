<template>
  <div class="min-h-screen p-4">
    <h1 class="text-2xl font-bold mb-4">HTTPS Camera Test</h1>
    
    <div class="space-y-4 mb-4">
      <div class="p-4 rounded-lg" :class="{
        'bg-green-100 border border-green-400': isHTTPS,
        'bg-red-100 border border-red-400': !isHTTPS
      }">
        <strong>HTTPS:</strong> {{ isHTTPS ? '✅ YES - Camera should work!' : '❌ NO - Camera blocked' }}
      </div>
      
      <div class="p-4 rounded-lg" :class="{
        'bg-green-100 border border-green-400': mediaDevicesAvailable,
        'bg-red-100 border border-red-400': !mediaDevicesAvailable
      }">
        <strong>navigator.mediaDevices:</strong> {{ mediaDevicesAvailable ? '✅ AVAILABLE' : '❌ UNDEFINED' }}
      </div>
    </div>

    <button @click="testCamera" class="w-full bg-blue-500 text-white p-4 rounded-lg font-bold mb-4">
      TEST CAMERA WITH HTTPS
    </button>

    <div v-if="testResult" class="p-4 bg-gray-100 rounded-lg">
      <pre class="text-sm">{{ testResult }}</pre>
    </div>

    <div v-if="stream" class="border-2 border-green-500 rounded-lg overflow-hidden mt-4">
      <video ref="videoEl" autoplay playsinline class="w-full h-64 object-cover"></video>
    </div>

    <!-- Instructions -->
    <div class="mt-6 p-4 bg-purple-100 border border-purple-400 rounded-lg">
      <h3 class="font-bold mb-2">ACCESS INSTRUCTIONS:</h3>
      <p class="text-sm mb-2">Use this URL on your phones:</p>
      <code class="bg-black text-green-400 p-2 rounded block text-sm">https://192.168.1.89:3000</code>
      <p class="text-sm mt-2 text-red-500">⚠️ You'll get a security warning - click "Advanced" → "Proceed anyway"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const videoEl = ref<HTMLVideoElement>()
const isHTTPS = ref(false)
const mediaDevicesAvailable = ref(false)
const stream = ref<MediaStream | null>(null)
const testResult = ref('')

onMounted(() => {
  isHTTPS.value = window.location.protocol === 'https:'
  mediaDevicesAvailable.value = !!navigator.mediaDevices
  testResult.value = `Protocol: ${window.location.protocol}\nmediaDevices: ${!!navigator.mediaDevices}`
})

const testCamera = async () => {
  testResult.value = 'Testing camera with HTTPS...\n\n'
  
  if (!isHTTPS.value) {
    testResult.value += '❌ STILL ON HTTP - Camera will fail!\n'
    testResult.value += 'Access via: https://192.168.1.89:3000'
    return
  }

  if (!navigator.mediaDevices) {
    testResult.value += '❌ navigator.mediaDevices still undefined!\n'
    return
  }

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.value = mediaStream
    
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream
    }
    
    testResult.value += '✅ HTTPS CAMERA SUCCESS!\n\n'
    testResult.value += `Camera is WORKING! 🎉\n`
    testResult.value += `Tracks: ${mediaStream.getVideoTracks().length}\n`
    testResult.value += `Ready: ${mediaStream.getVideoTracks()[0]?.readyState}\n\n`
    testResult.value += '🎯 QR Scanner should work now!'
    
  } catch (error: any) {
    testResult.value += '❌ Camera failed even with HTTPS:\n\n'
    testResult.value += `Error: ${error.name}\n`
    testResult.value += `Message: ${error.message}\n`
  }
}
</script>