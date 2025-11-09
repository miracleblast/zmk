<template>
  <div class="min-h-screen p-4">
    <h1 class="text-2xl font-bold mb-4">Camera Debug Test</h1>
    
    <!-- Test Results -->
    <div class="space-y-4 mb-4">
      <div class="p-4 rounded-lg" :class="cameraSupport ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'">
        <strong>Camera Support:</strong> {{ cameraSupport ? '✅ YES' : '❌ NO' }}
      </div>
      
      <div class="p-4 bg-blue-100 border border-blue-400 rounded-lg">
        <strong>User Agent:</strong> {{ userAgent }}
      </div>
      
      <div class="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <strong>HTTPS:</strong> {{ isHTTPS ? '✅ YES' : '❌ NO (THIS IS THE PROBLEM!)' }}
      </div>
    </div>

    <!-- Camera Test -->
    <div class="mb-4">
      <button @click="testCamera" class="w-full bg-blue-500 text-white p-4 rounded-lg font-bold">
        TEST CAMERA ACCESS
      </button>
    </div>

    <!-- Camera Preview -->
    <div v-if="stream" class="border-2 border-green-500 rounded-lg overflow-hidden">
      <video ref="videoEl" autoplay playsinline class="w-full h-64 object-cover"></video>
    </div>

    <!-- Results -->
    <div v-if="testResult" class="p-4 bg-gray-100 rounded-lg">
      <pre class="text-sm">{{ testResult }}</pre>
    </div>

    <!-- Solutions -->
    <div class="mt-6 p-4 bg-purple-100 border border-purple-400 rounded-lg">
      <h3 class="font-bold mb-2">SOLUTIONS:</h3>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Use <strong>Chrome</strong> on Android (best camera support)</li>
        <li>Add to <strong>Home Screen</strong> on iOS</li>
        <li>Ensure <strong>HTTPS</strong> in production</li>
        <li>Grant <strong>camera permissions</strong></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const videoEl = ref<HTMLVideoElement>()
const cameraSupport = ref(false)
const userAgent = ref('')
const isHTTPS = ref(false)
const stream = ref<MediaStream | null>(null)
const testResult = ref('')

onMounted(() => {
  userAgent.value = navigator.userAgent
  isHTTPS.value = window.location.protocol === 'https:'
  cameraSupport.value = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
})

const testCamera = async () => {
  testResult.value = 'Testing camera access...\n\n'
  
  try {
    // SIMPLE camera request - no fancy constraints
    const mediaStream = await navigator.mediaDevices.getUserMedia({ 
      video: true 
    })
    
    stream.value = mediaStream
    
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream
    }
    
    testResult.value += '✅ CAMERA SUCCESS!\n\n'
    testResult.value += `Tracks: ${mediaStream.getVideoTracks().length}\n`
    testResult.value += `Track label: ${mediaStream.getVideoTracks()[0]?.label || 'unknown'}\n`
    testResult.value += `Ready state: ${mediaStream.getVideoTracks()[0]?.readyState}\n\n`
    testResult.value += '🎉 Camera is WORKING! The issue is in our ScannerEngine.'
    
  } catch (error: any) {
    testResult.value += '❌ CAMERA FAILED:\n\n'
    testResult.value += `Error: ${error.name}\n`
    testResult.value += `Message: ${error.message}\n\n`
    
    if (error.name === 'NotAllowedError') {
      testResult.value += '🔒 PERMISSION DENIED:\n'
      testResult.value += '- Grant camera permission in browser settings\n'
      testResult.value += '- On iOS: Add to Home Screen first\n'
    } else if (error.name === 'NotFoundError') {
      testResult.value += '📷 NO CAMERA FOUND\n'
    } else if (error.name === 'NotSupportedError') {
      testResult.value += '🚫 BROWSER NOT SUPPORTED\n'
    }
  }
}
</script>