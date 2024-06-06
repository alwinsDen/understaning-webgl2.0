"use strict";

//this function loads the data from glsl file as text
/**
 * Loads a GLSL file from the specified URL.
 * @param {string} url - The URL of the GLSL file to load.
 * @returns {Promise<string>} - A promise that resolves with the loaded GLSL code as a string.
 */
const loadGLSL = async(url) => {
    const response = await fetch(url);
    return await response.text();
}

/**
 * Creates and compiles a shader program.
 *
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @param {number} type - The type of the shader to create. Can be either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
 * @param {string} source - The source code of the shader.
 * @returns {WebGLShader|undefined} The compiled shader program.
 */
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return undefined;
}

/**
 * Creates a WebGL program from given vertex and fragment shaders.
 *
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @param {WebGLShader} vertexShader - The vertex shader.
 * @param {WebGLShader} fragmentShader - The fragment shader.
 * @return {WebGLProgram|undefined} - The created program, or undefined if program creation or linking fails.
 */
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return undefined;
}

/**
 * Runs the main WebGL program.
 * @async
 * @return {Promise<void>} Resolves once the program has finished executing.
 */
async function main() {
    var canvas = document.querySelector("#c");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }
    //load the shaders
    var vertexShaderSource = await loadGLSL("VertexShader.glsl");
    var fragmentShaderSource = await loadGLSL("FragmentShader.glsl");
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = createProgram(gl, vertexShader, fragmentShader);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = [
        10, 20,
        80, 20,
        10, 30,
        10, 30,
        80, 20,
        80, 30,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);
    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

main();
