import jsQR from 'jsqr'

export class ScannerEngine {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isScanning: boolean = false;
  private animationFrameId: number | null = null;
  private onResultCallback: ((result: string) => void) | null = null;
  private usingFrontCamera: boolean = false;

  async initializeScanner(videoElement: HTMLVideoElement, useFrontCamera: boolean = false): Promise<boolean> {
    try {
      this.videoElement = videoElement;
      this.usingFrontCamera = useFrontCamera;
      
      // Create canvas for QR processing
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      
      if (!this.context) {
        throw new Error('Could not get canvas context');
      }

      // Camera constraints - FIXED: Support front/back camera switching
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: useFrontCamera ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      // Stop existing stream if any
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      // Request camera
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // iOS specific setup
      if (ScannerEngine.isIOS()) {
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('webkit-playsinline', 'true');
      }

      videoElement.srcObject = this.stream;
      
      return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play()
            .then(() => {
              this.isScanning = true;
              console.log('✅ Camera started - Front camera:', useFrontCamera);
              resolve(true);
            })
            .catch((error) => {
              console.error('❌ Video play failed:', error);
              resolve(false);
            });
        };
      });
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      return false;
    }
  }

  // REAL QR SCANNING - FIXED TO ACTUALLY WORK
  startContinuousScanning(onResult: (result: string) => void): void {
    this.onResultCallback = onResult;
    this.isScanning = true;
    console.log('🔍 Starting REAL QR scanning...');
    
    const scanFrame = async () => {
      if (!this.isScanning || !this.videoElement || !this.canvas || !this.context) {
        return;
      }

      try {
        // Check if video is ready
        if (this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) {
          this.animationFrameId = requestAnimationFrame(scanFrame);
          return;
        }

        // Set canvas size to match video
        this.canvas.width = this.videoElement.videoWidth;
        this.canvas.height = this.videoElement.videoHeight;

        // Draw current video frame to canvas
        this.context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

        // Get image data for QR processing
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // REAL QR CODE DETECTION - ACTUALLY CALLING jsQR
        const code = jsQR(
          imageData.data,
          imageData.width,
          imageData.height,
          {
            inversionAttempts: 'dontInvert',
          }
        );

        // If QR code found - STOP and return result
        if (code) {
          console.log('🎯 QR Code detected:', code.data);
          this.isScanning = false;
          
          if (this.onResultCallback) {
            this.onResultCallback(code.data);
          }
          
          this.stopScanner();
          return;
        }

      } catch (error) {
        console.error('❌ QR scanning error:', error);
      }

      // Continue scanning if no QR found
      if (this.isScanning) {
        this.animationFrameId = requestAnimationFrame(scanFrame);
      }
    };

    // Start the scanning loop
    scanFrame();
  }

  // MANUAL CAPTURE - For fallback when auto doesn't work
  async manualCapture(): Promise<string | null> {
    if (!this.videoElement || !this.canvas || !this.context) {
      return null;
    }

    try {
      // Capture current frame
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
      this.context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Try to detect QR code in captured frame
      const code = jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        {
          inversionAttempts: 'dontInvert',
        }
      );

      if (code) {
        console.log('📸 Manual capture - QR found:', code.data);
        return code.data;
      } else {
        console.log('📸 Manual capture - No QR code found');
        return null;
      }
    } catch (error) {
      console.error('❌ Manual capture error:', error);
      return null;
    }
  }

  // Switch between front and back cameras
  async switchCamera(videoElement: HTMLVideoElement): Promise<boolean> {
    this.usingFrontCamera = !this.usingFrontCamera;
    console.log('📸 Switching to:', this.usingFrontCamera ? 'front camera' : 'back camera');
    
    this.stopScanner();
    await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
    
    return this.initializeScanner(videoElement, this.usingFrontCamera);
  }

  stopScanner(): void {
    console.log('🛑 Stopping scanner');
    this.isScanning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    
    this.onResultCallback = null;
  }

  // Utility methods
  static isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  static isCameraSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // Get current camera state
  isFrontCamera(): boolean {
    return this.usingFrontCamera;
  }

  isScanningActive(): boolean {
    return this.isScanning;
  }
}