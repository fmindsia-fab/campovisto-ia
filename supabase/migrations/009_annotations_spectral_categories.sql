-- Migration 009: expande CHECK constraint de image_annotations.category
-- para incluir as 5 categorias espectrais usadas pelo editor e pela IA

alter table public.image_annotations
  drop constraint if exists image_annotations_category_check;

alter table public.image_annotations
  add constraint image_annotations_category_check
  check (category in (
    -- categorias originais
    'bovine', 'pasture', 'bare_soil', 'cattle_trail', 'wetland',
    'fence', 'waterer', 'shade', 'crop', 'structure', 'attention_point',
    -- categorias espectrais (NDVI, NDRE, EVI, SAVI, NDWI)
    'pasture_degradation', 'water_stress', 'low_biomass',
    'nutrient_deficiency', 'healthy_vegetation'
  ));
