<template>
  <canvas
    ref="canvas"
    :width="imageSize.width"
    :height="imageSize.height"
    @mousedown="startDrag"
    @mousemove="dragging"
    @mouseup="endDrag"
    @mouseleave="endDrag"
  ></canvas>
</template>

<script setup>
import { useWindowSize } from "@vueuse/core";
import { ref, onMounted, inject, computed, onUnmounted, watch } from "vue";
import { swipeApi } from "@/api/device/phoneHandle";

const props = defineProps({
  controllerDeviceIdstr: {
    type: String,
    default: "",
  },
});

const binaryArrayChunks = inject("screenCastingData");

const { width, height } = useWindowSize();
const imageSize = computed(() => ({
  width: (height.value * 0.8 * 9) / 17.8,
  height: height.value * 0.8,
}));

const canvas = ref(null);
let gl;
let program;
let positionBuffer;
let texCoordBuffer;
let texture;
let animationFrameId;
let lastDrawTime = 0;
const FPS = 30;
const frameInterval = 1000 / FPS;

const imageBuffer = [];
const MAX_BUFFER_SIZE = 5;

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function initWebGL() {
  gl = canvas.value.getContext("webgl", { alpha: false });
  if (!gl) {
    console.error("WebGL not supported");
    return;
  }

  // ... (WebGL 初始化代码保持不变)
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  program = createProgram(gl, vertexShader, fragmentShader);

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]),
    gl.STATIC_DRAW
  );

  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function startRendering() {
  const render = (timestamp) => {
    if (timestamp - lastDrawTime >= frameInterval) {
      drawImage();
      lastDrawTime = timestamp;
    }
    animationFrameId = requestAnimationFrame(render);
  };
  animationFrameId = requestAnimationFrame(render);
}

async function processImage(base64Data) {
  const imageData = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(imageData.length);
  const uintArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < imageData.length; i++) {
    uintArray[i] = imageData.charCodeAt(i);
  }

  const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
  return await createImageBitmap(blob);
}

async function drawImage() {
  if (imageBuffer.length === 0) return;

  const imageBitmap = imageBuffer.shift();

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  imageBitmap.close();
}

async function handleWebSocketData(data) {
  if (!data.base64) return;

  const imageBitmap = await processImage(data.base64);

  if (imageBuffer.length >= MAX_BUFFER_SIZE) {
    const oldestImage = imageBuffer.shift();
    oldestImage.close();
  }

  imageBuffer.push(imageBitmap);
}

const isDragging = ref(false); // 新增：拖拽状态标志

const startX = ref(0);
const startY = ref(0);
const endX = ref(0);
const endY = ref(0);

const getCanvasPoint = (event) => {
  const canvas2x = canvas.value;
  if (!canvas2x) return { x: 0, y: 0 };
  const rect = canvas2x.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const startDrag = (event) => {
  isDragging.value = true; // 设置拖拽状态为 true
  const { x, y } = getCanvasPoint(event);
  startX.value = x;
  startY.value = y;
  endX.value = 0;
  endY.value = 0;
};

const dragging = (event) => {
  if (!isDragging.value) return;
  // 在拖拽过程中可以做一些其他操作，例如实时绘制
};

const endDrag = (event) => {
  if (!isDragging.value) return;
  const { x, y } = getCanvasPoint(event);
  endX.value = x;
  endY.value = y;

  const x1Percent = startX.value / imageSize.value.width;
  const y1Percent = startY.value / imageSize.value.height;
  const x2Percent = endX.value / imageSize.value.width;
  const y2Percent = endY.value / imageSize.value.height;

  const phoneX1 = x1Percent * binaryArrayChunks.value.width;
  const phoneY1 = y1Percent * binaryArrayChunks.value.height;
  const phoneX2 = x2Percent * binaryArrayChunks.value.width;
  const phoneY2 = y2Percent * binaryArrayChunks.value.height;

  swipeApi({
    x1: phoneX1.toFixed(0),
    y1: phoneY1.toFixed(0),
    x2: phoneX2.toFixed(0),
    y2: phoneY2.toFixed(0),
    controllerDeviceIdStr: props.controllerDeviceIdstr,
  });

  isDragging.value = false; // 拖拽结束后设置状态为 false
};

onMounted(() => {
  initWebGL();
  startRendering();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  imageBuffer.forEach((img) => img.close());
  imageBuffer.length = 0;
});

watch(binaryArrayChunks, (newValue) => {
  handleWebSocketData(newValue);
});
</script>
