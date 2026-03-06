import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_URL } from '../../../../core/config/api.config';
import type { CreateRetiroDTO, Retiro, UpdateRetiroDTO } from '../../domain/models/retiro.model';
import { RetiroPort } from '../../domain/ports/retiro.port';
import { RetiroApiAdapter } from './retiro-api.adapter';

describe('RetiroApiAdapter', () => {
  let adapter: RetiroApiAdapter;
  let httpTesting: HttpTestingController;
  const fakeApiUrl = 'http://test-api.com';

  const mockRetiro: Retiro = {
    id: 1,
    fechaInicio: '2026-02-15',
    fechaFin: '2026-02-20',
    ubicacion: 'Ávila',
    codigo: 'ABC123',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RetiroPort, useClass: RetiroApiAdapter },
        { provide: API_URL, useValue: fakeApiUrl },
      ],
    });

    adapter = TestBed.inject(RetiroPort) as RetiroApiAdapter;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getAll', () => {
    it('sends GET to /retiros with page and limit params', () => {
      const mockResponse = { data: [mockRetiro], page: 1, limit: 20, total: 1 };

      adapter.getAll(1, 20).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne((r) => r.url === `${fakeApiUrl}/retiros`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('20');
      req.flush(mockResponse);
    });

    it('includes ubicacion param when provided', () => {
      const mockResponse = { data: [mockRetiro], page: 1, limit: 20, total: 1 };

      adapter.getAll(1, 20, 'Ávila').subscribe();

      const req = httpTesting.expectOne((r) => r.url === `${fakeApiUrl}/retiros`);
      expect(req.request.params.get('ubicacion')).toBe('Ávila');
      req.flush(mockResponse);
    });

    it('does not include ubicacion param when not provided', () => {
      const mockResponse = { data: [], page: 1, limit: 20, total: 0 };

      adapter.getAll(1, 20).subscribe();

      const req = httpTesting.expectOne((r) => r.url === `${fakeApiUrl}/retiros`);
      expect(req.request.params.has('ubicacion')).toBe(false);
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('sends GET to /retiros/:id', () => {
      adapter.getById(1).subscribe((res) => {
        expect(res).toEqual(mockRetiro);
      });

      const req = httpTesting.expectOne(`${fakeApiUrl}/retiros/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRetiro);
    });
  });

  describe('create', () => {
    it('sends POST to /retiros with the DTO body', () => {
      const dto: CreateRetiroDTO = {
        fechaInicio: '2026-02-15',
        fechaFin: '2026-02-20',
        ubicacion: 'Ávila',
      };

      adapter.create(dto).subscribe((res) => {
        expect(res).toEqual(mockRetiro);
      });

      const req = httpTesting.expectOne(`${fakeApiUrl}/retiros`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockRetiro);
    });
  });

  describe('update', () => {
    it('sends PATCH to /retiros/:id with the DTO body', () => {
      const dto: UpdateRetiroDTO = { ubicacion: 'Madrid' };
      const updated = { ...mockRetiro, ubicacion: 'Madrid' };

      adapter.update(1, dto).subscribe((res) => {
        expect(res).toEqual(updated);
      });

      const req = httpTesting.expectOne(`${fakeApiUrl}/retiros/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(updated);
    });
  });

  describe('delete', () => {
    it('sends DELETE to /retiros/:id', () => {
      adapter.delete(1).subscribe();

      const req = httpTesting.expectOne(`${fakeApiUrl}/retiros/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
