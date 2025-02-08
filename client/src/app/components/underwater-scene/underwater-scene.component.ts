import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
    standalone: true,
    selector: 'app-underwater-scene',
    templateUrl: './underwater-scene.component.html',
    styleUrls: ['./underwater-scene.component.scss'],
})
export class UnderwaterSceneComponent implements OnInit {
    @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private particles!: THREE.Points;
    //private clock = new THREE.Clock();
    private mouseX = 0;
    private mouseY = 0;

    ngOnInit() {
        this.initScene();
        this.animate();
    }

    private initScene() {
        const container = this.canvasContainer.nativeElement;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x6ea5ff, 0.8); // Effet sous-marin

        // Camera
        this.camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x6ea5ff, 1);
        container.appendChild(this.renderer.domElement);

        // Lumières
        const ambientLight = new THREE.AmbientLight(0xfef7cd, 0.7);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xfec6a1, 1);
        directionalLight.position.set(0, 1, 2);
        this.scene.add(directionalLight);

        // Particules (bulles)
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 1500;
        const posArray = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 15;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.03,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);

        // Écouteurs d'événements
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    private animate = () => {
        requestAnimationFrame(this.animate);

        this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.08;
        this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.08;
        this.camera.lookAt(this.scene.position);

        this.particles.rotation.y += 0.002;
        this.particles.position.y = Math.sin(Date.now() * 0.001) * 0.2;
        this.particles.position.x = Math.cos(Date.now() * 0.001) * 0.1;

        this.renderer.render(this.scene, this.camera);
    };

    private onMouseMove(event: MouseEvent) {
        this.mouseX = (event.clientX - window.innerWidth / 2) / 100;
        this.mouseY = (event.clientY - window.innerHeight / 2) / 100;
    }

    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
