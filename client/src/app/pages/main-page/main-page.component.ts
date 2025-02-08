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

    constructor() {}
    ngAfterViewInit(): void {
        // this.initSuperGif(() => {});
        this.initThreeJs();
        this.animate();
    }

    private initThreeJs(): void {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 3.5);

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
        // const alphaMap = textureLoader.load('./assets/02_earthspec1k.jpg');

        this.globeGroup = new THREE.Group();
        this.scene.add(this.globeGroup);
        const waterTexture = textureLoader.load('assets/water.png');

        const geo = new THREE.IcosahedronGeometry(1, 10);
        const mat = new THREE.MeshBasicMaterial({ map: waterTexture });
        const cube = new THREE.Mesh(geo, mat);
        this.globeGroup.add(cube);

        const detail = 120;
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
            // alphaTexture: { value: alphaMap },
        };

        const pointsMat = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
        });

        const points = new THREE.Points(pointsGeo, pointsMat);
        this.globeGroup.add(points);

        // Lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 3);
        this.scene.add(hemiLight);

        // Add stars
        const stars = getStarfield({ numStars: 4500, sprite: starSprite });
        this.scene.add(stars);

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
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
