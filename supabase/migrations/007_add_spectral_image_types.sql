-- Migration 007: adiciona tipos de imagem multiespectral ao check constraint
-- Remove o constraint antigo e recria com os novos tipos NDVI/NDRE/EVI/SAVI/NDWI

alter table public.inspection_images
  drop constraint if exists inspection_images_image_type_check;

alter table public.inspection_images
  add constraint inspection_images_image_type_check
  check (image_type in (
    'overview', 'pasture', 'livestock', 'bare_soil', 'water',
    'fence', 'waterer', 'crop', 'structure', 'wetland', 'other',
    'ndvi', 'ndre', 'evi', 'savi', 'ndwi'
  ));
