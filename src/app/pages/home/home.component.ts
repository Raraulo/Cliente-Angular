import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogoProductosComponent } from '../../components/catalogo-productos.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CatalogoProductosComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  @ViewChild('heroVideo') videoRef!: ElementRef<HTMLVideoElement>;
  videoPausado = false;

  toggleVideo() {
    const video = this.videoRef.nativeElement;
    if (video.paused) {
      video.play();
      this.videoPausado = false;
    } else {
      video.pause();
      this.videoPausado = true;
    }
  }
}
