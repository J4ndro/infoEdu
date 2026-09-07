import csv from 'csv-parser';
import { Readable } from 'stream';
import { Center, FPCycle } from '@/types';
import { cache } from 'react';
import privateWebsites from '@/data/privateWebsites.json';

const privateWebsitesMap = privateWebsites as Record<string, string>;

const CENTROS_URL = 'https://dadesobertes.gva.es/dataset/68eb1d94-76d3-4305-8507-e1aab7717d0e/resource/1aa53c3a-4639-41aa-ac85-d58254c428c0/download/centros-docentes-de-la-comunitat-valenciana.csv';
const FP_URL = 'https://dadesobertes.gva.es/dataset/a2183efe-f62c-48ec-bdbe-22a4b63c3832/resource/79af67de-71a2-48b1-bd6d-57a2996e2669/download/alumnos-matriculados-fp_2025.csv';

// Variables globales para caché en memoria (sobrevive en la instancia del contenedor de Vercel)
let cachedCenters: Center[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export const getCenters = cache(async (): Promise<Center[]> => {
  const now = Date.now();
  if (cachedCenters && (now - lastFetchTime < CACHE_TTL)) {
    console.log("⚡ [CACHE SERVIDOR] Retornando centros educativos desde memoria caché");
    return cachedCenters;
  }

  console.log("🌐 [FETCH SERVIDOR] Descargando y procesando nuevos datos de GVA");

  try {
    // Fetch FP data
    const fpResponse = await fetch(FP_URL, { next: { revalidate: 86400 } });
    if (!fpResponse.ok) {
      throw new Error(`Failed to fetch FP data: ${fpResponse.statusText}`);
    }
    const fpText = await fpResponse.text();

    const fpMap = new Map<string, Map<string, FPCycle>>(); // cod_centro -> Map of unique cycles

    await new Promise<void>((resolve, reject) => {
      Readable.from(fpText)
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => {
          const codCentro = data.COD_CENTRO;
          if (!codCentro) return;

          if (!fpMap.has(codCentro)) {
            fpMap.set(codCentro, new Map());
          }

          const family = data.NOM_FAMILIA || 'OTRAS FAMILIAS';
          let grade = data.NOM_GRADO || 'Desconocido';
          const name = data.NOM_CICLO || 'Desconocido';

          // Clean up grade names
          if (grade.includes('MEDIO')) grade = 'Grado Medio';
          else if (grade.includes('SUPERIOR')) grade = 'Grado Superior';
          else if (grade.includes('BÁSICA')) grade = 'FP Básica';

          // Fix name casing
          const formatName = (str: string) => {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
          };

          const key = `${family}|${grade}|${name}`;
          fpMap.get(codCentro)!.set(key, { 
            family: formatName(family), 
            grade, 
            name: formatName(name) 
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Fetch Centers data
    const response = await fetch(CENTROS_URL, { next: { revalidate: 86400 } });
    if (!response.ok) {
      throw new Error(`Failed to fetch centers data: ${response.statusText}`);
    }
    const text = await response.text();
    const results: Center[] = [];

    await new Promise<void>((resolve, reject) => {
      Readable.from(text)
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => {
          // Basic filtering to ensure valid coordinates
          if (!data.latitud || !data.longitud) return;

          const lat = parseFloat(data.latitud.replace(',', '.'));
          const lng = parseFloat(data.longitud.replace(',', '.'));

          if (isNaN(lat) || isNaN(lng)) return;

          // Infer levels based on denominacion_generica_es
          const denominacionGenerica = (data.denominacion_generica_es || '').toUpperCase();
          const niveles: string[] = [];
          if (denominacionGenerica.includes('INFANTIL')) niveles.push('Infantil');
          if (denominacionGenerica.includes('PRIMARIA')) niveles.push('Primaria');
          if (denominacionGenerica.includes('SECUNDARIA')) niveles.push('ESO');
          if (denominacionGenerica.includes('BACHILLERATO') || denominacionGenerica.includes('SECUNDARIA')) niveles.push('Bachillerato');

          // Check actual FP cycles
          const fpCyclesMap = fpMap.get(data.codigo);
          const fpCycles = fpCyclesMap ? Array.from(fpCyclesMap.values()) : [];

          if (fpCycles.length > 0 || denominacionGenerica.includes('FORMACIÓN PROFESIONAL') || denominacionGenerica.includes('FORMACION PROFESIONAL') || denominacionGenerica.includes('SECUNDARIA')) {
            if (!niveles.includes('FP')) niveles.push('FP');
          }

          let tipo = 'Desconocido';
          const regimen = data.regimen || '';
          if (regimen.includes('PÚB') || regimen.includes('PUB')) tipo = 'Público';
          else if (regimen.includes('CONC')) tipo = 'Concertado';
          else if (regimen.includes('PRIV')) tipo = 'Privado';

          const customWebsite = privateWebsitesMap[data.codigo];
          const defaultGvaUrl = tipo === 'Público' ? `https://portal.edu.gva.es/${data.codigo}/` : data.url_es;
          const finalUrl = customWebsite || defaultGvaUrl;
          const gvaUrl = data.url_es || (tipo === 'Público' ? `https://portal.edu.gva.es/${data.codigo}/` : undefined);
          const hasCustomUrl = Boolean(customWebsite);

          results.push({
            id: data.codigo,
            name: data.denominacion_especifica || data.denominacion,
            type: tipo,
            address: `${data.tipo_via || ''} ${data.direccion || ''} ${data.numero || ''}`.trim(),
            zipCode: data.codigo_postal,
            municipality: data.localidad,
            province: data.provincia,
            phone: data.telefono,
            lat: lat,
            lng: lng,
            levels: niveles,
            url: finalUrl,
            gvaUrl: gvaUrl,
            hasCustomUrl: hasCustomUrl,
            fpCycles: fpCycles
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    cachedCenters = results;
    lastFetchTime = Date.now();
    console.log(`✅ [CACHE SERVIDOR] Guardados ${results.length} centros en caché de memoria`);

    return results;
  } catch (error) {
    console.error("❌ [API ERROR] Fallo al descargar/procesar datos de la GVA:", error);
    if (cachedCenters) {
      console.log("⚠️ [FALLBACK CACHÉ] Retornando versión anterior de centros en memoria");
      return cachedCenters;
    }
    return [];
  }
});
