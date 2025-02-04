class Sphere {
    constructor() {
        this.type = 'sphere';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 10.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        const vertices = [];
        const indices = [];
        const lat_lines = 20;
        const long_lines = 20;
        

        for (let i = 0; i <= long_lines; i++) {
            const phi = (i / long_lines) * Math.PI;
            for (let j = 0; j <= lat_lines; j++) {
                const theta = (j / lat_lines) * 2 * Math.PI; 
                const x = Math.sin(phi) * Math.cos(theta);
                const y = Math.sin(phi) * Math.sin(theta);
                const z = Math.cos(phi);
                vertices.push(x, y, z);
            }
        }

        for (let i = 0; i < long_lines; i++) {
            for (let j = 0; j < lat_lines; j++) {
                const first = i * (lat_lines + 1) + j;
                const second = first + lat_lines + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

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
        for (let i = 0; i < indices.length; i += 3) {
            const v1 = indices[i] * 3;
            const v2 = indices[i + 1] * 3;
            const v3 = indices[i + 2] * 3;

            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            drawTriangle3D([
                vertices[v1], vertices[v1 + 1], vertices[v1 + 2],
                vertices[v2], vertices[v2 + 1], vertices[v2 + 2],
                vertices[v3], vertices[v3 + 1], vertices[v3 + 2]
            ]);
        }
    }
}