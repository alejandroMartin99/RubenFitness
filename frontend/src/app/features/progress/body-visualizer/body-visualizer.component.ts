import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as THREE from 'three';

type Segment =
  | 'torso'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'leftArm'
  | 'rightArm'
  | 'leftLeg'
  | 'rightLeg';

@Component({
  selector: 'app-body-visualizer',
  templateUrl: './body-visualizer.component.html',
  styleUrls: ['./body-visualizer.component.scss']
})
export class BodyVisualizerComponent implements OnInit, OnDestroy {
  @Input() muscles: string[] = [];

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private frameId: number | null = null;
  private segments: Record<Segment, THREE.Mesh> = {} as any;

  ngOnInit(): void {
    this.initScene();
    this.createFigure();
    this.animate();
    this.updateHighlights();
  }

  ngOnDestroy(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  ngOnChanges(): void {
    this.updateHighlights();
  }

  private initScene(): void {
    const container = document.getElementById('body-visualizer-canvas');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 320;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0b0c);

    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.5, 8);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(2, 4, 5);
    this.scene.add(ambient, dir);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);
  }

  private createBox(
    w: number,
    h: number,
    d: number,
    color: number,
    position: [number, number, number]
  ): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.05
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    this.scene.add(mesh);
    return mesh;
  }

  private createFigure(): void {
    const base = 0x1a1a1e;
    // Torso/back combined
    this.segments.torso = this.createBox(2, 3, 1.2, base, [0, 1.5, 0]);
    // Chest front placeholder
    this.segments.chest = this.createBox(2, 1, 0.4, base, [0, 2.2, 0.8]);
    // Back overlay
    this.segments.back = this.createBox(2, 1.2, 0.3, base, [0, 1.6, -0.8]);
    // Shoulders
    this.segments.shoulders = this.createBox(2.4, 0.6, 1, base, [0, 3.1, 0]);
    // Arms
    this.segments.leftArm = this.createBox(0.6, 2.4, 0.8, base, [-1.5, 2.0, 0]);
    this.segments.rightArm = this.createBox(0.6, 2.4, 0.8, base, [1.5, 2.0, 0]);
    // Legs
    this.segments.leftLeg = this.createBox(0.9, 2.8, 0.9, base, [-0.6, -0.4, 0]);
    this.segments.rightLeg = this.createBox(0.9, 2.8, 0.9, base, [0.6, -0.4, 0]);
    // Head
    this.createBox(1.0, 1.0, 1.0, base, [0, 3.8, 0]);
  }

  private muscleToSegments(): Set<Segment> {
    const map: Record<string, Segment[]> = {
      espalda: ['back', 'torso'],
      dorsal: ['back', 'torso'],
      biceps: ['leftArm', 'rightArm'],
      triceps: ['leftArm', 'rightArm'],
      pecho: ['chest', 'shoulders'],
      deltoides: ['shoulders'],
      hombro: ['shoulders'],
      pierna: ['leftLeg', 'rightLeg'],
      cuadriceps: ['leftLeg', 'rightLeg'],
      femoral: ['leftLeg', 'rightLeg'],
      gluteo: ['leftLeg', 'rightLeg'],
      brazo: ['leftArm', 'rightArm']
    };

    const result = new Set<Segment>();
    this.muscles.forEach((m) => {
      const key = m.toLowerCase();
      const segs = map[key];
      if (segs) segs.forEach((s) => result.add(s));
    });
    return result;
  }

  private updateHighlights(): void {
    if (!this.segments || !Object.keys(this.segments).length) return;
    const active = this.muscleToSegments();
    const base = 0x1a1a1e;
    const highlight = 0xfacc15;

    Object.entries(this.segments).forEach(([key, mesh]) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.set(active.has(key as Segment) ? highlight : base);
      mat.emissive.set(active.has(key as Segment) ? highlight : 0x000000);
      mat.emissiveIntensity = active.has(key as Segment) ? 0.35 : 0.0;
    });
  }

  private animate = () => {
    if (!this.scene || !this.renderer || !this.camera) return;
    this.scene.rotation.y += 0.0035;
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };
}

