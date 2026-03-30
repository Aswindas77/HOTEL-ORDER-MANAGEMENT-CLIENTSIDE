import { Injectable } from '@angular/core';
import Toastify from 'toastify-js';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {

    const gradients: Record<string, string> = {
      success: 'linear-gradient(135deg, rgba(26,22,18,0.90) 0%, rgba(44,36,22,0.85) 55%, rgba(60,50,28,0.78) 100%)',
      error: 'linear-gradient(135deg, rgba(26,22,18,0.96) 0%, rgba(36,28,20,0.92) 55%, rgba(44,36,24,0.88) 100%)',
      warning: 'linear-gradient(135deg, rgba(44,36,22,0.88) 0%, rgba(62,50,26,0.84) 55%, rgba(80,64,30,0.78) 100%)',
      info: 'linear-gradient(135deg, rgba(26,22,18,0.92) 0%, rgba(40,32,20,0.88) 55%, rgba(52,42,24,0.82) 100%)',
    };

    const icons: Record<string, string> = {
      success: '✦',
      error: '!',
      warning: '⚠',
      info: 'ℹ',
    };

    const background = gradients[type] ?? gradients['info'];
    const icon = icons[type] ?? icons['info'];

    Toastify({
      text: `<span style="display:flex;align-items:center;gap:10px;">
               <span style="
                 display:inline-flex;
                 align-items:center;
                 justify-content:center;
                 width:22px;height:22px;
                 border-radius:50%;
                 background:rgba(201,168,76,0.18);
                 color:#C9A84C;
                 font-size:12px;
                 flex-shrink:0;
                 border:1px solid rgba(201,168,76,0.35);
               ">${icon}</span>
               <span style="font-family:'Georgia',serif;font-size:14px;letter-spacing:0.02em;color:#F5F0E8;">${message}</span>
             </span>`,
      duration: 2500,
      gravity: 'top',
      position: 'center',
      escapeMarkup: false,
      style: {
        background,
        borderRadius: '10px',
        padding: '12px 18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(201,168,76,0.25) inset',
        border: '1px solid rgba(184,146,46,0.22)',
        minWidth: '280px',
        maxWidth: '420px',
      },
      offset: {
        x: 0,
        y: 16,
      },
    }).showToast();
  }
}