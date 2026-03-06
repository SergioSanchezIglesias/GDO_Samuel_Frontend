import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_URL } from '../../../core/config/api.config';
import { TokenStoragePort } from '../../auth/domain/ports/token-storage.port';
import type { CreateOracionDTO } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';
import { OracionesApiAdapter } from './oraciones-api.adapter';

const fakeApiUrl = 'http://test-api.com';

// Fake JWT with payload { sub: '10', idRetiro: 5 }
const fakeJwt = `header.${btoa(JSON.stringify({ sub: '10', idRetiro: 5 }))}.signature`;

const mockTokenStorage = {
  accessToken: signal<string | null>(fakeJwt),
  isAuthenticated: signal(false),
  userRole: signal(null),
  saveTokens: () => {},
  getRefreshToken: () => null,
  clearTokens: () => {},
};

describe('OracionesApiAdapter', () => {
  let adapter: OracionesApiAdapter;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OracionesPort, useClass: OracionesApiAdapter },
        { provide: API_URL, useValue: fakeApiUrl },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    });

    adapter = TestBed.inject(OracionesPort) as OracionesApiAdapter;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('list', () => {
    it('sends GET to /oraciones with usuarioId, retiroId, page and limit params', () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
      };

      adapter.list(10, 5).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${fakeApiUrl}/oraciones`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('usuarioId')).toBe('10');
      expect(req.request.params.get('retiroId')).toBe('5');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('20');
      req.flush(mockResponse);
    });

    it('uses custom page and limit when provided', () => {
      const mockResponse = { data: [], page: 2, limit: 10, total: 0 };

      adapter.list(10, 5, 2, 10).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${fakeApiUrl}/oraciones`);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('sends POST to /oraciones with the DTO body', () => {
      const dto: CreateOracionDTO = {
        laudes: 1,
        visperas: 0,
        completas: 0,
        angelusReginaCoeli: 0,
        misteriosRosario: 0,
        horasSantisimo: 0,
        horasOracion: 2,
        novenas: 0,
        horasTrabajo: 8,
        horasEstudio: 1,
        horasDeporte: 0,
        horasOracionCantando: 0,
        ayunos: 0,
        coronillas: 0,
        voluntariados: 0,
        misas: 1,
      };
      const mockOracion = { id: 1, usuarioId: 10, retiroId: 5, ...dto };

      adapter.create(dto).subscribe(res => {
        expect(res).toEqual(mockOracion);
      });

      const req = httpTesting.expectOne(`${fakeApiUrl}/oraciones`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ...dto, usuarioId: 10, retiroId: 5 });
      req.flush(mockOracion);
    });
  });

  describe('getSumatorio', () => {
    it('sends GET to /oraciones/sumatorio/:retiroId', () => {
      const mockSumatorio = {
        laudes: 5,
        visperas: 3,
        completas: 2,
        angelusReginaCoeli: 0,
        misteriosRosario: 0,
        horasSantisimo: 0,
        horasOracion: 10,
        novenas: 0,
        horasTrabajo: 40,
        horasEstudio: 10,
        horasDeporte: 5,
        horasOracionCantando: 0,
        ayunos: 2,
        coronillas: 1,
        voluntariados: 0,
        misas: 8,
      };

      adapter.getSumatorio(5).subscribe(res => {
        expect(res).toEqual(mockSumatorio);
      });

      const req = httpTesting.expectOne(`${fakeApiUrl}/oraciones/sumatorio/5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSumatorio);
    });
  });
});
