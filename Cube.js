class Cube {
    constructor() {
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 10.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = 0;

        this.verts = [
            1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
            1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0,

            0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,


            0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0,
            0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0,


            0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,


            0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,


            0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0
        ];

        this.uv = [
            1, 0, 1, 1, 0, 0,
            0, 1, 1, 1, 0, 0,

            0, 0, 1, 0, 0, 1,
            1, 1, 1, 0, 0, 1,

            1, 0, 0, 0, 1, 1,
            0, 1, 0, 0, 1, 1,

            0, 1, 1, 1, 0, 0,
            1, 0, 1, 1, 0, 0,

            1, 0, 0, 1, 0, 0,
            1, 0, 1, 1, 0, 1,

            1, 1, 1, 0, 0, 0,
            0, 1, 1, 1, 0, 0,
        ];
    }


    render_deprecated() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable

        gl.uniform1i(u_whichTexture, this.textureNum);
        // var d = this.size / 200.0;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //let angleStep = 360 / this.segments;
        /*for (var angle = 0; angle < 360; angle = angle + angleStep) {
            //console.log(angle)
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
            let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
            let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
            //console.log([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]])
            drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
        }*/



        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3DUV([1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0], [1, 0, 1, 1, 0, 0]);
        drawTriangle3DUV([1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0], [0, 1, 1, 1, 0, 0]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3DUV([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0], [0, 0, 1, 0, 0, 1]);
        drawTriangle3DUV([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0], [1, 1, 1, 0, 0, 1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
        drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0], [1, 0, 0, 0, 1, 1]);
        drawTriangle3DUV([0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0], [0, 1, 0, 0, 1, 1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        drawTriangle3DUV([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0], [0, 1, 1, 1, 0, 0]);
        drawTriangle3DUV([1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0], [1, 0, 1, 1, 0, 0]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0], [1, 0, 0, 1, 0, 0]);
        drawTriangle3DUV([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], [1, 0, 1, 1, 0, 1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3DUV([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], [1, 1, 1, 0, 0, 0]);
        drawTriangle3DUV([1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0], [0, 1, 1, 1, 0, 0]);
    }

    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null) {
            initCubeBuffers();
        }

        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);

        // Set up the vertex attribute pointer for position
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Bind the UV buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uv), gl.STATIC_DRAW);

        // Set up the vertex attribute pointer for UV coordinates
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, 36); // 36 vertices in total
    }
}

function initCubeBuffers() {
    // Create and bind the vertex buffer
    g_vertexBuffer = gl.createBuffer();
    if (!g_vertexBuffer) {
        console.log("Failed to create the vertex buffer object");
        return -1;
    }

    // Create and bind the UV buffer
    g_uvBuffer = gl.createBuffer();
    if (!g_uvBuffer) {
        console.log("Failed to create the UV buffer object");
        return -1;
    }
}