var scene, camera, renderer, controls, car;
var posX = 0.0,
    posY = 0.0,
    rotX = 0.0,
    rotY = 0.0,
    angleWheel = 0.0,
    angleCar = 90.0;

if (Detector.webgl) {
    init();
    animate();
} else {
    var warning = Detector.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}

function init() {
    scene = new THREE.Scene();

    // Create Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
    camera.position.set(0, 0, 120);
    scene.add(camera);

    // Create Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(renderer.domElement);

    // Create a light, set its position, and add it to the scene.
    var light = new THREE.PointLight(0x000000);
    light.position.set(-100, 200, 100);
    scene.add(light);

    // Add OrbitControls for panning around with the mouse.
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Draw Axis
    var material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-100, 0, 0));
    geometry.vertices.push(new THREE.Vector3(100, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 100, 0));
    geometry.vertices.push(new THREE.Vector3(0, -100, 0));
    var axis = new THREE.Line(geometry, material);
    scene.add(axis);

    // Draw Map
    var map = [
        [-6, 0, -6, 22, -1, 0],
        [-6, 22, 18, 22, 0, 1],
        [18, 22, 18, 37, -1, 0],
        [6, 0, 6, 10, 1, 0],
        [6, 10, 30, 10, 0, -1],
        [30, 10, 30, 37, 1, 0]
    ];
    var wallHeight = 10;
    var wallWidth = 2;
    var loader = new THREE.TextureLoader();
    loader.load('./Car-Module/src/texture_wall.jpg', function (texture) {
        material = new THREE.MeshBasicMaterial({
            map: texture
        });
        map.forEach(function (coordinate) {
            var xDistance = coordinate[2] - coordinate[0];
            var yDistance = coordinate[3] - coordinate[1];
            var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
            var radians = Math.atan2(yDistance, xDistance);
            geometry = new THREE.BoxGeometry(distance + Math.abs(coordinate[5] * wallWidth), wallWidth, wallHeight);
            var wall = new THREE.Mesh(geometry, material);
            wall.position.set((coordinate[0] + coordinate[2]) / 2 + coordinate[4] * wallWidth / 2 - coordinate[5] * wallWidth / 2,
                (coordinate[1] + coordinate[3]) / 2 + coordinate[5] * wallWidth / 2, wallHeight / 2);
            wall.rotateZ(radians);
            scene.add(wall);
        });
    });

    // Create Car Sphere
    var sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
    loader = new THREE.TextureLoader();
    loader.load('./Car-Module/src/texture_rock.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(2, 2);
        material = new THREE.MeshBasicMaterial({
            map: texture
        });
        car = new THREE.Mesh(sphereGeometry, material);
        car.position.set(posX, posY, 3);
        //car.geometry.attributes.position.needsUpdate = true;
        scene.add(car);
    });

    setInterval(updateMotion, 100);

    // Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    document.onkeydown = function (e) {
        switch (e.keyCode) {
            case 37:
                // Left
                --posX;
                rotY += 0.1;
                break;
            case 65:
                // A
                if (angleWheel > -40)
                    --angleWheel;
                break;

            case 38:
            case 87:
                // Up & W
                ++posY;
                rotX += 0.1;
                break;

            case 39:
                // Right
                ++posX;
                rotY += 0.1;
                break;
            case 68:
                // D
                if (angleWheel < 40)
                    ++angleWheel;
                break;

            case 40:
            case 83:
                // Down & S
                --posY;
                rotX += 0.1;
                break;

            case 32:
                // Start/Stop (space)
                run = !run;
                break;

            case 82:
                // Reset (R)
                posX = posY = rotX = rotY = angleWheel = 0.0;
                angleCar = 90.0;
                break;
        }
    };
}

var run = false;

function updateMotion() {
    if (run) {
        var phi = degreeToRadian(angleCar);
        var delta = degreeToRadian(angleWheel);
        posX = posX + Math.cos(phi + delta) + Math.sin(delta) * Math.sin(phi);
        posY = posY + Math.sin(phi + delta) - Math.sin(delta) * Math.cos(phi);
        rotY = rotY + 0.1 * Math.cos(phi + delta) + Math.sin(delta) * Math.sin(phi);
        rotX = rotX - 0.1 * Math.sin(phi + delta) - Math.sin(delta) * Math.cos(phi);
        phi = phi - Math.asin((2.0 * Math.sin(delta)) / 6.0);
        angleCar = 180.0 * phi / Math.PI;
        if (angleCar > 270)
            angleCar -= 360;
        else if (angleCar < -90)
            angleCar += 360;
        console.log(angleCar);
        document.getElementById('x').innerHTML = posX.toFixed(4);
        document.getElementById('y').innerHTML = posY.toFixed(4);
        document.getElementById('angleWheel').innerHTML = angleWheel.toFixed(1);
        document.getElementById('angleCar').innerHTML = angleCar.toFixed(1);
    }
}

function degreeToRadian(degree) {
    return degree * Math.PI / 180.0;
}

function animate() {
    requestAnimationFrame(animate);
    car.position.set(posX, posY, 3);
    car.rotation.set(rotX, rotY, 0);
    renderer.render(scene, camera);
    controls.update();
}
