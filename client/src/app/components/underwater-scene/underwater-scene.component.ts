import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
    private isDragging = false;
    private previousMouseX = 0;
    private previousMouseY = 0;

    ngOnInit() {
        this.initScene();
        this.loadModels();
        this.render();
    }

    private fishModels: THREE.Group[] = [];
    private trashModels: THREE.Group[] = [];
    private fishDirections: number[] = []; // Direction de chaque poisson (+1 = droite, -1 = gauche)

    private loadModels() {
      const loader = new GLTFLoader();
      const fishPaths = [
          '../../../assets/fish1.glb',
          '../../../assets/Fish.glb',
          '../../../assets/JohnDory.glb',
          '../../../assets/Fish (1).glb'
      ];
      const trashPaths = [
          '../../../assets/Trash Bags.glb' // Liste des modèles de déchets
      ];
  
      for (let i = 0; i < 30; i++) { // Ajouter 30 poissons
        const randomFish = fishPaths[Math.floor(Math.random() * fishPaths.length)];
    
        loader.load(randomFish, (gltf) => {
            const fish = gltf.scene;
    
            // Taille aléatoire pour les poissons
            const scaleFactor = Math.random() * 0.3 + 0.1;
            fish.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
            // Positionner les poissons
            fish.position.set(
                Math.random() * window.innerWidth * 0.02 - 10, // Étaler sur toute la largeur
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 15
            );
    
            this.scene.add(fish);
            this.fishModels.push(fish);
            this.fishDirections.push(Math.random() < 0.5 ? 1 : -1); // Direction aléatoire droite ou gauche
        });
    }
    
  
      // Charger les déchets SANS ANIMATION
      trashPaths.forEach((trashPath) => {
          loader.load(trashPath, (gltf) => {
              const trash = gltf.scene;
  
              // Taille aléatoire pour les poubelles
              const scaleFactor = Math.random() * 0.5 + 0.2;
              trash.scale.set(scaleFactor, scaleFactor, scaleFactor);
  
              // Positionner les poubelles
              trash.position.set(
                  (Math.random() - 0.5) * 15,
                  (Math.random() - 0.5) * 5,
                  (Math.random() - 0.5) * 10
              );
  
              this.scene.add(trash);
              this.trashModels.push(trash); // Ajouter dans `trashModels` pour ne PAS les animer
          });
      });
  
      this.render();
  }
  

  private animateFish() {
    this.fishModels.forEach((fish, index) => {
        const speed = 0.005 + Math.random() * 0.002; // Vitesse légèrement variable

        // Déplacement strictement horizontal
        fish.position.x += speed * this.fishDirections[index];

        // Changer de direction lorsqu'ils atteignent les bords de l'écran
        if (fish.position.x > 10) {
            this.fishDirections[index] = -1; // Va vers la gauche
            fish.rotation.y = Math.PI; // Tourne pour aller vers la gauche
        } else if (fish.position.x < -10) {
            this.fishDirections[index] = 1; // Va vers la droite
            fish.rotation.y = 0; // Tourne pour aller vers la droite
        }
    });
}




  
    private initScene() {
        const container = this.canvasContainer.nativeElement;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x6ea5ff, 0.1); // Effet sous-marin

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 5);

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

        // Charger la texture de bulle
        const textureLoader = new THREE.TextureLoader();
        const bubbleTexture = textureLoader.load('../../../assets/bubble.png');

        // Création des bulles
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;
        const posArray = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            posArray[i * 3] = (Math.random() - 0.5) * 15;
            posArray[i * 3 + 1] = (Math.random() - 0.5) * 15;
            posArray[i * 3 + 2] = (Math.random() - 0.5) * 15;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.2, 
            map: bubbleTexture,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);

        // Écouteurs d'événements pour le mouvement manuel
        container.addEventListener('mousedown', (event: MouseEvent) => this.onMouseDown(event));
        container.addEventListener('mouseup', () => this.onMouseUp());
        container.addEventListener('mousemove', (event: MouseEvent) => this.onMouseMove(event));

        // Redimensionnement de la fenêtre
        window.addEventListener('resize', () => this.onWindowResize());

        this.render(); // 👈 Forcer un premier rendu après l'initialisation
    }

    private render = () => {
        this.animateFish();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
    };

    private onMouseDown(event: MouseEvent) {
        this.isDragging = true;
        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;
    }

    private onMouseUp() {
        this.isDragging = false;
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;

        const deltaX = event.clientX - this.previousMouseX;
        const deltaY = event.clientY - this.previousMouseY;

        // Déplacer la caméra en fonction du mouvement de la souris
        this.camera.position.x -= deltaX * 0.01;
        this.camera.position.y += deltaY * 0.01;
        this.camera.lookAt(this.scene.position);

        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;

        this.render(); // 👈 Mettre à jour l'affichage uniquement quand on bouge
    }

    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render(); // 👈 Mettre à jour l'affichage après resize
    }
    
}
