import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import getStarfield from '@app/utils/getStarfield';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
declare var SuperGif: any;

@Component({
    selector: 'app-main-page',
    standalone: true,
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    imports: [RouterLink],
})
export class MainPageComponent implements AfterViewInit {
    @ViewChild('canvasContainer', { static: true }) private canvasContainer!: ElementRef;

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private orbitCtrl!: OrbitControls;
    private globeGroup!: THREE.Group;
    private buttons: THREE.Mesh[] = [];
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();

    constructor() {}

    ngAfterViewInit(): void {
        // this.initSuperGif(() => {});
        this.initThreeJs();
        this.animate();
    }

    private initThreeJs(): void {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0.2, 3.8);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);

        this.orbitCtrl = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitCtrl.enableDamping = true;

        const textureLoader = new THREE.TextureLoader();
        const starSprite = textureLoader.load('./assets/star.gif');
        const colorMap = textureLoader.load('./assets/00_earthmap1k.jpg');
        const elevMap = textureLoader.load('./assets/01_earthbump1k.jpg');
        const alphaMap = textureLoader.load('./assets/water.jpg');

        this.globeGroup = new THREE.Group();
        this.scene.add(this.globeGroup);
        // const waterTexture = textureLoader.load('assets/water.png');

        const geo = new THREE.IcosahedronGeometry(1, 15);
        const mat = new THREE.MeshStandardMaterial({
            map: colorMap,
            bumpMap: elevMap,
            bumpScale: 3,
        });
        const globe = new THREE.Mesh(geo, mat);
        this.globeGroup.add(globe);

        const detail = 200;
        const pointsGeo = new THREE.IcosahedronGeometry(1, detail);

        const vertexShader = `
        uniform float size;
        uniform sampler2D elevTexture;

        varying vec2 vUv;
        varying float vVisible;

        void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float elv = texture2D(elevTexture, vUv).r;

            vec3 vNormal = normalMatrix * normal;
            vVisible = step(0.0, dot(-normalize(mvPosition.xyz), normalize(vNormal)));
           
            mvPosition.z += 0.35 * elv;
          
            gl_PointSize = size;
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

        const fragmentShader = `
        uniform sampler2D colorTexture;
        uniform sampler2D alphaTexture;

        varying vec2 vUv;
        varying float vVisible;

        void main() {
            if (floor(vVisible + 0.1) == 0.0) discard;
            float alpha = 1.0 - texture2D(alphaTexture, vUv).r;
            vec3 color = texture2D(colorTexture, vUv).rgb;
            gl_FragColor = vec4(color, alpha);
        }
    `;

        const uniforms = {
            size: { value: 4.0 },
            colorTexture: { value: colorMap },
            elevTexture: { value: elevMap },
            alphaTexture: { value: alphaMap },
        };

        const pointsMat = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
        });

        const points = new THREE.Points(pointsGeo, pointsMat);
        this.globeGroup.add(points);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Soft overall light
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(2, 2, 5);
        this.scene.add(directionalLight);

        const stars = getStarfield({ numStars: 4500, sprite: starSprite });
        this.scene.add(stars);
        this.addButtonsToGlobe();

        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('click', this.onMouseClick.bind(this));
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    private latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        return new THREE.Vector3(-(radius * Math.sin(phi) * Math.cos(theta)), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
    }

    private addButtonsToGlobe(): void {
        const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color

        const locations = [
            { lat: -10.7128, lon: -100.006 }, // New York
            { lat: 48.8566, lon: 2.3522 }, // Paris
            { lat: 35.6895, lon: 139.6917 }, // Tokyo
        ];

        locations.forEach((location) => {
            const pos = this.latLonToVector3(location.lat, location.lon, 1.02); // 1.02 = slightly above surface
            const buttonGeometry = new THREE.SphereGeometry(0.02, 16, 16);
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.copy(pos);
            this.globeGroup.add(button);
            this.buttons.push(button);
        });
    }

    private onMouseClick(event: MouseEvent): void {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.buttons);

        if (intersects.length > 0) {
            const clickedButton = intersects[0].object as THREE.Mesh;
            clickedButton.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        }
    }
    private onMouseMove(event: MouseEvent): void {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.buttons);

        if (intersects.length > 0) {
            this.renderer.domElement.style.cursor = 'pointer'; // ✅ Change to pointer when over a button
        } else {
            this.renderer.domElement.style.cursor = 'default'; // ✅ Reset to default when not hovering
        }
    }

    private animate(): void {
        requestAnimationFrame(() => this.animate());
        this.globeGroup.rotation.y += 0.002;
        this.orbitCtrl.update();
        this.renderer.render(this.scene, this.camera);
    }

    @HostListener('window:resize')
    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
