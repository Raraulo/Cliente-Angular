import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogoProductosComponent } from '../../components/catalogo-productos.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CatalogoProductosComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @ViewChild('heroVideo') videoRef!: ElementRef<HTMLVideoElement>;
  videoPausado = false;

  animales = [
    {
      name: 'Perros',
      text: 'Alimentos, juguetes y correas',
      link: '/perros',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Gatos',
      text: 'Rascadores, camas y snacks',
      link: '/gatos',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Peces',
      text: 'Acuarios, alimento y cuidado',
      link: '/peces',
      image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Aves',
      text: 'Jaulas, semillas y vitaminas',
      link: '/aves',
      image: 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Pequenos',
      text: 'Casitas, heno y accesorios',
      link: '/pequenos',
      image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=700&q=80',
    },
    {
      name: 'Granja',
      text: 'Cuidado para grandes amigos',
      link: '/granja',
      image: 'https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=700&q=80',
    },
  ];

  toggleVideo() {
    const video = this.videoRef?.nativeElement;
    if (!video) {
      this.videoPausado = !this.videoPausado;
      return;
    }

    if (video.paused) {
      video.play();
      this.videoPausado = false;
    } else {
      video.pause();
      this.videoPausado = true;
    }
  }
}
